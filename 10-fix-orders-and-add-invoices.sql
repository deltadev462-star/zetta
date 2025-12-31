-- Fix 1: Add INSERT policies for orders table
-- Allow authenticated users to create orders where they are the buyer
CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = buyer_id);

-- Fix 2: Create invoices table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    buyer_id UUID REFERENCES auth.users(id) NOT NULL,
    seller_id UUID REFERENCES auth.users(id) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue')) DEFAULT 'draft',
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX idx_invoices_buyer_id ON public.invoices(buyer_id);
CREATE INDEX idx_invoices_seller_id ON public.invoices(seller_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- Enable RLS for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Buyers can view their own invoices" ON public.invoices
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view invoices for their orders" ON public.invoices
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all invoices" ON public.invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- System/trigger can insert invoices
CREATE POLICY "System can insert invoices" ON public.invoices
    FOR INSERT WITH CHECK (true);

-- Admins can manage invoices
CREATE POLICY "Admins can manage invoices" ON public.invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    last_number INTEGER;
    new_number TEXT;
BEGIN
    -- Format: INV-YYYYMM-XXXXX
    year_month := TO_CHAR(CURRENT_DATE, 'YYYYMM');
    
    -- Get the last invoice number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 12 FOR 5) AS INTEGER)), 0) + 1
    INTO last_number
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-' || year_month || '-%';
    
    -- Format with leading zeros
    new_number := 'INV-' || year_month || '-' || LPAD(last_number::TEXT, 5, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create invoice on order payment
CREATE OR REPLACE FUNCTION create_invoice_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only create invoice when payment is confirmed
    IF NEW.payment_status = 'paid' AND (OLD IS NULL OR OLD.payment_status != 'paid') THEN
        INSERT INTO public.invoices (
            order_id,
            invoice_number,
            buyer_id,
            seller_id,
            subtotal,
            tax_amount,
            total_amount,
            issue_date,
            due_date,
            status
        ) VALUES (
            NEW.id,
            generate_invoice_number(),
            NEW.buyer_id,
            NEW.seller_id,
            NEW.total_amount, -- Using total as subtotal since tax is calculated separately
            0, -- Tax will be calculated by the application
            NEW.total_amount,
            NOW(),
            NOW() + INTERVAL '30 days',
            'paid'
        )
        ON CONFLICT (order_id) DO NOTHING; -- Prevent duplicate invoices for same order
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to auto-create invoices
CREATE TRIGGER create_invoice_on_order_payment
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION create_invoice_on_payment();

-- Fix 3: Add missing RLS policies for order_items and payments
-- Allow users to insert order items for their orders
CREATE POLICY "Users can create order items for their orders" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_items.order_id
            AND buyer_id = auth.uid()
        )
    );

-- Allow users to view order items for their orders
CREATE POLICY "Buyers can view their order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_items.order_id
            AND buyer_id = auth.uid()
        )
    );

-- Allow sellers to view order items for their products
CREATE POLICY "Sellers can view order items for their products" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_items.order_id
            AND seller_id = auth.uid()
        )
    );

-- Allow payments to be created for user's orders
CREATE POLICY "Users can create payments for their orders" ON public.payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = payments.order_id
            AND buyer_id = auth.uid()
        )
    );

-- Allow users to view payments for their orders
CREATE POLICY "Buyers can view their payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = payments.order_id
            AND buyer_id = auth.uid()
        )
    );

-- Allow sellers to view payments for their orders
CREATE POLICY "Sellers can view payments for their orders" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = payments.order_id
            AND seller_id = auth.uid()
        )
    );

-- Add admin policies for order_items and payments
CREATE POLICY "Admins can manage all order items" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Add unique constraint on order_id in invoices to ensure one invoice per order
ALTER TABLE public.invoices ADD CONSTRAINT unique_invoice_per_order UNIQUE (order_id);