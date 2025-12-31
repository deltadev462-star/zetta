-- Create commissions table
CREATE TABLE public.commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
    seller_id UUID REFERENCES auth.users(id) NOT NULL,
    order_amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.15, -- 15% default
    commission_amount DECIMAL(10, 2) NOT NULL,
    seller_payout DECIMAL(10, 2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'calculated', 'paid', 'failed')) DEFAULT 'pending',
    calculated_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supplier payments table
CREATE TABLE public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES auth.users(id) NOT NULL,
    payment_period_start DATE NOT NULL,
    payment_period_end DATE NOT NULL,
    total_sales DECIMAL(10, 2) NOT NULL,
    total_commission DECIMAL(10, 2) NOT NULL,
    payout_amount DECIMAL(10, 2) NOT NULL,
    order_count INTEGER NOT NULL DEFAULT 0,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    payment_method TEXT,
    payment_reference TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_commissions_seller_id ON public.commissions(seller_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_commissions_order_id ON public.commissions(order_id);
CREATE INDEX idx_supplier_payments_seller_id ON public.supplier_payments(seller_id);
CREATE INDEX idx_supplier_payments_status ON public.supplier_payments(status);
CREATE INDEX idx_supplier_payments_period ON public.supplier_payments(payment_period_start, payment_period_end);

-- Enable RLS
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for commissions
CREATE POLICY "Sellers can view their own commissions" ON public.commissions
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all commissions" ON public.commissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- RLS Policies for supplier payments
CREATE POLICY "Sellers can view their own payments" ON public.supplier_payments
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all payments" ON public.supplier_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate commission on order creation/update
CREATE OR REPLACE FUNCTION calculate_order_commission()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process paid orders
    IF NEW.payment_status = 'paid' AND (OLD IS NULL OR OLD.payment_status != 'paid') THEN
        -- Insert or update commission record
        INSERT INTO public.commissions (
            order_id,
            seller_id,
            order_amount,
            commission_rate,
            commission_amount,
            seller_payout,
            status,
            calculated_at
        ) VALUES (
            NEW.id,
            NEW.seller_id,
            NEW.total_amount,
            0.15, -- 15% commission rate
            ROUND(NEW.total_amount * 0.15, 2),
            ROUND(NEW.total_amount * 0.85, 2),
            'calculated',
            NOW()
        )
        ON CONFLICT (order_id) DO UPDATE SET
            order_amount = EXCLUDED.order_amount,
            commission_amount = EXCLUDED.commission_amount,
            seller_payout = EXCLUDED.seller_payout,
            status = 'calculated',
            calculated_at = NOW(),
            updated_at = NOW();
        
        -- Update order with commission amount
        NEW.commission_amount = ROUND(NEW.total_amount * 0.15, 2);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate commission
CREATE TRIGGER calculate_commission_on_payment
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_commission();

-- View for commission dashboard
CREATE OR REPLACE VIEW commission_summary AS
SELECT 
    c.seller_id,
    up.full_name as seller_name,
    up.company_name,
    COUNT(DISTINCT c.order_id) as total_orders,
    SUM(c.order_amount) as total_sales,
    SUM(c.commission_amount) as total_commission,
    SUM(c.seller_payout) as total_payout,
    SUM(CASE WHEN c.status = 'calculated' THEN c.seller_payout ELSE 0 END) as pending_payout,
    SUM(CASE WHEN c.status = 'paid' THEN c.seller_payout ELSE 0 END) as paid_payout
FROM public.commissions c
LEFT JOIN public.user_profiles up ON c.seller_id = up.user_id
GROUP BY c.seller_id, up.full_name, up.company_name;

-- Grant access to the view
GRANT SELECT ON commission_summary TO authenticated;