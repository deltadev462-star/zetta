-- Add status and suspension fields to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'suspended', 'deactivated')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;

-- Create user activities table
CREATE TABLE public.user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suspension logs table
CREATE TABLE public.suspension_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT CHECK (action IN ('suspend', 'unsuspend', 'deactivate', 'reactivate')) NOT NULL,
    reason TEXT NOT NULL,
    suspended_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_action ON public.user_activities(action);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at);
CREATE INDEX idx_suspension_logs_user_id ON public.suspension_logs(user_id);
CREATE INDEX idx_suspension_logs_admin_id ON public.suspension_logs(admin_id);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspension_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user activities
CREATE POLICY "Users can view their own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activities" ON public.user_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "System can insert activities" ON public.user_activities
    FOR INSERT WITH CHECK (true);

-- RLS Policies for suspension logs
CREATE POLICY "Admins can manage suspension logs" ON public.suspension_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can view their own suspension logs" ON public.suspension_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Function to log user activities
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log important user activities
    IF TG_TABLE_NAME = 'orders' AND TG_OP = 'INSERT' THEN
        INSERT INTO public.user_activities (user_id, action, details)
        VALUES (NEW.buyer_id, 'order_created', jsonb_build_object('order_id', NEW.id, 'amount', NEW.total_amount));
    ELSIF TG_TABLE_NAME = 'service_requests' AND TG_OP = 'INSERT' THEN
        INSERT INTO public.user_activities (user_id, action, details)
        VALUES (NEW.user_id, 'service_request_created', jsonb_build_object('request_id', NEW.id, 'type', NEW.type));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity logging
CREATE TRIGGER log_order_activity
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER log_service_request_activity
    AFTER INSERT ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_user_activity();

-- Function to check and auto-unsuspend users
CREATE OR REPLACE FUNCTION check_user_suspensions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Unsuspend users whose suspension period has expired
    UPDATE public.user_profiles
    SET status = 'active',
        suspension_reason = NULL,
        suspended_until = NULL
    WHERE status = 'suspended'
    AND suspended_until IS NOT NULL
    AND suspended_until < NOW();
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- View for user management dashboard
CREATE OR REPLACE VIEW user_management_overview AS
SELECT 
    up.user_id,
    up.full_name,
    up.company_name,
    up.role,
    up.status,
    up.suspension_reason,
    up.suspended_until,
    u.email,
    u.created_at as user_created_at,
    u.last_sign_in_at,
    (SELECT COUNT(*) FROM orders WHERE buyer_id = up.user_id) as total_orders,
    (SELECT SUM(total_amount) FROM orders WHERE buyer_id = up.user_id) as total_spent,
    (SELECT COUNT(*) FROM products WHERE seller_id = up.user_id) as total_products,
    (SELECT MAX(created_at) FROM orders WHERE buyer_id = up.user_id) as last_order_date,
    (SELECT COUNT(*) FROM user_activities WHERE user_id = up.user_id AND created_at > NOW() - INTERVAL '30 days') as activities_last_30_days
FROM public.user_profiles up
JOIN auth.users u ON up.user_id = u.id;

-- Grant access to the view
GRANT SELECT ON user_management_overview TO authenticated;

-- Add policies for user_profiles to allow admins to update status
CREATE POLICY "Admins can update user profiles" ON public.user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );