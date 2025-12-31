-- Product approval workflow ----------------------------------------------------

-- Add approval_status to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS approval_status TEXT
  CHECK (approval_status IN ('pending','approved','rejected'))
  DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_products_approval_status ON public.products(approval_status);

-- Replace permissive public select policy to require approval
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Anyone can view available products') THEN
    EXECUTE 'DROP POLICY "Anyone can view available products" ON public.products';
  END IF;
END $$;

CREATE POLICY "Public can view approved & available products"
  ON public.products
  FOR SELECT
  USING (status = 'available' AND approval_status = 'approved');

-- Allow sellers to view their own products regardless of approval
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='Sellers can view their own products') THEN
    CREATE POLICY "Sellers can view their own products"
      ON public.products
      FOR SELECT
      USING (auth.uid() = seller_id);
  END IF;
END $$;

-- Ensure sellers can manage their own products (already present in base schema)
-- CREATE POLICY "Sellers can manage their own products" ON public.products
--   FOR ALL USING (auth.uid() = seller_id);

-- Admins can approve products
CREATE POLICY "Admins can update product approval"
  ON public.products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications system ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES auth.users(id), -- null for admin-wide notifications
  recipient_role TEXT CHECK (recipient_role IN ('admin','user')) NOT NULL DEFAULT 'user',
  type TEXT NOT NULL, -- e.g., 'order_paid','order_created','service_request','product_needs_approval'
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_role ON public.notifications(recipient_role);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users see their own notifications
CREATE POLICY "Users see their notifications"
  ON public.notifications
  FOR SELECT
  USING (recipient_role = 'user' AND recipient_id = auth.uid());

-- Admins see admin notifications
CREATE POLICY "Admins see admin notifications"
  ON public.notifications
  FOR SELECT
  USING (
    recipient_role = 'admin' AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert admin notifications
CREATE POLICY "Admins can insert admin notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    recipient_role = 'admin' AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System trigger functions to generate notifications on key events
CREATE OR REPLACE FUNCTION public.notify_order_paid()
RETURNS TRIGGER AS $$
DECLARE
  seller UUID;
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD IS NULL OR OLD.payment_status IS DISTINCT FROM 'paid') THEN
    seller := NEW.seller_id;

    -- notify seller
    INSERT INTO public.notifications(recipient_id, recipient_role, type, title, message, metadata)
    VALUES (
      seller, 'user', 'order_paid',
      'Order paid',
      'An order was paid and is ready for fulfillment',
      jsonb_build_object('order_id', NEW.id, 'total', NEW.total_amount)
    );

    -- notify admins (admin-wide)
    INSERT INTO public.notifications(recipient_id, recipient_role, type, title, message, metadata)
    VALUES (
      NULL, 'admin', 'order_paid',
      'Order paid',
      'A new order payment has been confirmed',
      jsonb_build_object('order_id', NEW.id, 'seller_id', seller, 'total', NEW.total_amount)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_order_paid ON public.orders;
CREATE TRIGGER trg_notify_order_paid
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_order_paid();

-- Service requests notifications
CREATE OR REPLACE FUNCTION public.notify_service_request()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- notify admins for new request
    INSERT INTO public.notifications(recipient_id, recipient_role, type, title, message, metadata)
    VALUES (
      NULL, 'admin', 'service_request',
      'New service request',
      'A new ' || NEW.type || ' request has been submitted',
      jsonb_build_object('request_id', NEW.id, 'user_id', NEW.user_id, 'type', NEW.type)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_service_request ON public.service_requests;
CREATE TRIGGER trg_notify_service_request
AFTER INSERT ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_service_request();

-- Product approval notification for admins
CREATE OR REPLACE FUNCTION public.notify_product_pending()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP IN ('INSERT','UPDATE') THEN
    IF NEW.approval_status = 'pending' THEN
      INSERT INTO public.notifications(recipient_id, recipient_role, type, title, message, metadata)
      VALUES (
        NULL, 'admin', 'product_needs_approval',
        'Product pending approval',
        'A product requires approval',
        jsonb_build_object('product_id', NEW.id, 'seller_id', NEW.seller_id, 'title', NEW.title)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_product_pending ON public.products;
CREATE TRIGGER trg_notify_product_pending
AFTER INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.notify_product_pending();

-- Supplier contracts -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.supplier_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT, -- Supabase Storage URL
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('active','expired','terminated','draft')) DEFAULT 'draft',
  terms JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_contracts_supplier_id ON public.supplier_contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_contracts_status ON public.supplier_contracts(status);

ALTER TABLE public.supplier_contracts ENABLE ROW LEVEL SECURITY;

-- Admins manage all contracts
CREATE POLICY "Admins manage contracts"
  ON public.supplier_contracts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Supplier can view their contracts
CREATE POLICY "Suppliers view own contracts"
  ON public.supplier_contracts
  FOR SELECT
  USING (supplier_id = auth.uid());

-- CRM (leads and interactions) -------------------------------------------------

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT, -- e.g., 'web','email','phone','import'
  name TEXT,
  email TEXT,
  company TEXT,
  status TEXT CHECK (status IN ('new','contacted','qualified','won','lost')) DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT CHECK (interaction_type IN ('call','email','meeting','note')) NOT NULL,
  content TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned_to ON public.crm_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_lead_id ON public.crm_interactions(lead_id);

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;

-- Admin-only CRM access
CREATE POLICY "Admins manage CRM leads"
  ON public.crm_leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins manage CRM interactions"
  ON public.crm_interactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Zetta price override / source -----------------------------------------------

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS zetta_price_source TEXT
  CHECK (zetta_price_source IN ('auto','manual'))
  DEFAULT 'auto';

CREATE INDEX IF NOT EXISTS idx_products_zetta_price_source ON public.products(zetta_price_source);

-- Helper view for price comparison in admin/product UIs
CREATE OR REPLACE VIEW public.product_price_comparison AS
SELECT
  id,
  seller_id,
  title,
  price AS seller_price,
  zetta_price,
  zetta_price_source,
  (price - zetta_price) AS price_delta,
  category,
  condition,
  approval_status,
  status,
  created_at,
  updated_at
FROM public.products;

GRANT SELECT ON public.product_price_comparison TO authenticated;
