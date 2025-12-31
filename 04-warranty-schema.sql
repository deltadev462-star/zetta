-- Create warranties table
CREATE TABLE public.warranties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) NOT NULL,
    order_id UUID REFERENCES public.orders(id) NOT NULL,
    buyer_id UUID REFERENCES auth.users(id) NOT NULL,
    warranty_type TEXT CHECK (warranty_type IN ('standard', 'extended')) DEFAULT 'standard',
    duration_months INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT CHECK (status IN ('active', 'expired', 'claimed', 'void')) DEFAULT 'active',
    price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warranty extensions table
CREATE TABLE public.warranty_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warranty_id UUID REFERENCES public.warranties(id) ON DELETE CASCADE NOT NULL,
    duration_months INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    payment_reference TEXT,
    extended_from DATE NOT NULL,
    extended_to DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warranty claims table
CREATE TABLE public.warranty_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warranty_id UUID REFERENCES public.warranties(id) ON DELETE CASCADE NOT NULL,
    claim_number TEXT UNIQUE NOT NULL,
    issue_description TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'resolved')) DEFAULT 'pending',
    resolution TEXT,
    claimed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_warranties_buyer_id ON public.warranties(buyer_id);
CREATE INDEX idx_warranties_product_id ON public.warranties(product_id);
CREATE INDEX idx_warranties_order_id ON public.warranties(order_id);
CREATE INDEX idx_warranties_status ON public.warranties(status);
CREATE INDEX idx_warranties_end_date ON public.warranties(end_date);
CREATE INDEX idx_warranty_extensions_warranty_id ON public.warranty_extensions(warranty_id);
CREATE INDEX idx_warranty_claims_warranty_id ON public.warranty_claims(warranty_id);
CREATE INDEX idx_warranty_claims_status ON public.warranty_claims(status);

-- Enable RLS
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for warranties
CREATE POLICY "Buyers can view their own warranties" ON public.warranties
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view warranties for their products" ON public.warranties
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE id = warranties.product_id
            AND seller_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all warranties" ON public.warranties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- RLS Policies for warranty extensions
CREATE POLICY "Users can view their warranty extensions" ON public.warranty_extensions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.warranties
            WHERE id = warranty_extensions.warranty_id
            AND buyer_id = auth.uid()
        )
    );

CREATE POLICY "Users can create warranty extensions" ON public.warranty_extensions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.warranties
            WHERE id = warranty_extensions.warranty_id
            AND buyer_id = auth.uid()
            AND status = 'active'
        )
    );

-- RLS Policies for warranty claims
CREATE POLICY "Users can view and manage their warranty claims" ON public.warranty_claims
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.warranties
            WHERE id = warranty_claims.warranty_id
            AND buyer_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can view claims for their products" ON public.warranty_claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.warranties w
            JOIN public.products p ON w.product_id = p.id
            WHERE w.id = warranty_claims.warranty_id
            AND p.seller_id = auth.uid()
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_warranties_updated_at BEFORE UPDATE ON public.warranties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warranty_claims_updated_at BEFORE UPDATE ON public.warranty_claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create warranty on order completion
CREATE OR REPLACE FUNCTION create_order_warranty()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    product RECORD;
BEGIN
    -- Only create warranties for paid orders
    IF NEW.payment_status = 'paid' AND (OLD IS NULL OR OLD.payment_status != 'paid') THEN
        -- Create warranty for each order item
        FOR item IN SELECT * FROM public.order_items WHERE order_id = NEW.id
        LOOP
            -- Get product details
            SELECT * INTO product FROM public.products WHERE id = item.product_id;
            
            IF product IS NOT NULL THEN
                -- Determine warranty duration based on condition
                DECLARE
                    duration_months INTEGER;
                    start_date DATE := CURRENT_DATE;
                    end_date DATE;
                BEGIN
                    CASE product.condition
                        WHEN 'excellent' THEN duration_months := 24;
                        WHEN 'good' THEN duration_months := 12;
                        WHEN 'fair' THEN duration_months := 6;
                        ELSE duration_months := 6;
                    END CASE;
                    
                    end_date := start_date + INTERVAL '1 month' * duration_months;
                    
                    -- Create warranty
                    INSERT INTO public.warranties (
                        product_id,
                        order_id,
                        buyer_id,
                        warranty_type,
                        duration_months,
                        start_date,
                        end_date,
                        status,
                        price
                    ) VALUES (
                        item.product_id,
                        NEW.id,
                        NEW.buyer_id,
                        'standard',
                        duration_months,
                        start_date,
                        end_date,
                        'active',
                        0 -- Standard warranty is free
                    );
                END;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create warranties
CREATE TRIGGER create_warranty_on_order_completion
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION create_order_warranty();

-- Function to check and update expired warranties
CREATE OR REPLACE FUNCTION update_expired_warranties()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.warranties
    SET status = 'expired'
    WHERE status = 'active'
    AND end_date < CURRENT_DATE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- View for warranty dashboard
CREATE OR REPLACE VIEW warranty_overview AS
SELECT 
    w.id,
    w.buyer_id,
    w.warranty_type,
    w.duration_months,
    w.start_date,
    w.end_date,
    w.status,
    w.price,
    p.title as product_name,
    p.category as product_category,
    p.condition as product_condition,
    o.id as order_number,
    up.full_name as buyer_name,
    (SELECT COUNT(*) FROM warranty_claims wc WHERE wc.warranty_id = w.id) as claim_count,
    (SELECT COUNT(*) FROM warranty_extensions we WHERE we.warranty_id = w.id AND we.payment_status = 'paid') as extension_count
FROM public.warranties w
JOIN public.products p ON w.product_id = p.id
JOIN public.orders o ON w.order_id = o.id
LEFT JOIN public.user_profiles up ON w.buyer_id = up.user_id;

-- Grant access to the view
GRANT SELECT ON warranty_overview TO authenticated;