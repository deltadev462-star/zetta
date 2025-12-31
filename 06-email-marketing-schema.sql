-- Create email templates table
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    category TEXT CHECK (category IN ('promotional', 'transactional', 'newsletter', 'welcome', 'abandoned_cart')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer segments table
CREATE TABLE public.customer_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL,
    customer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email campaigns table
CREATE TABLE public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_id UUID REFERENCES public.email_templates(id) NOT NULL,
    segment_id UUID REFERENCES public.customer_segments(id),
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused')) DEFAULT 'draft',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email analytics table
CREATE TABLE public.email_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) NOT NULL,
    email TEXT NOT NULL,
    status TEXT CHECK (status IN ('sent', 'bounced', 'opened', 'clicked', 'unsubscribed')) DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email preferences table for unsubscribe management
CREATE TABLE public.email_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    marketing_emails BOOLEAN DEFAULT true,
    transactional_emails BOOLEAN DEFAULT true,
    newsletter BOOLEAN DEFAULT true,
    product_updates BOOLEAN DEFAULT true,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_templates_category ON public.email_templates(category);
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled_at ON public.email_campaigns(scheduled_at);
CREATE INDEX idx_email_analytics_campaign_id ON public.email_analytics(campaign_id);
CREATE INDEX idx_email_analytics_recipient_id ON public.email_analytics(recipient_id);
CREATE INDEX idx_email_analytics_status ON public.email_analytics(status);
CREATE INDEX idx_email_preferences_user_id ON public.email_preferences(user_id);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Email templates - readable by all authenticated users, writable by admins
CREATE POLICY "Email templates are viewable by authenticated users" ON public.email_templates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage email templates" ON public.email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Customer segments - admin only
CREATE POLICY "Admins can manage customer segments" ON public.customer_segments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Email campaigns - admin only
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Email analytics - admin can view all, users can view their own
CREATE POLICY "Users can view their own email analytics" ON public.email_analytics
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can view all email analytics" ON public.email_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Email preferences - users manage their own
CREATE POLICY "Users can manage their own email preferences" ON public.email_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_segments_updated_at BEFORE UPDATE ON public.customer_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON public.email_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for campaign metrics
CREATE OR REPLACE FUNCTION increment_campaign_opens(campaign_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.email_campaigns
    SET open_count = open_count + 1
    WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_campaign_clicks(campaign_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.email_campaigns
    SET click_count = click_count + 1
    WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create email preferences for new users
CREATE OR REPLACE FUNCTION create_email_preferences_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.email_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create email preferences on user creation
CREATE TRIGGER create_email_preferences_on_user_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_email_preferences_for_new_user();

-- View for campaign performance
CREATE OR REPLACE VIEW campaign_performance AS
SELECT 
    c.id,
    c.name,
    c.subject,
    c.status,
    c.sent_at,
    c.sent_count,
    c.open_count,
    c.click_count,
    CASE 
        WHEN c.sent_count > 0 THEN ROUND((c.open_count::NUMERIC / c.sent_count) * 100, 2)
        ELSE 0
    END as open_rate,
    CASE 
        WHEN c.open_count > 0 THEN ROUND((c.click_count::NUMERIC / c.open_count) * 100, 2)
        ELSE 0
    END as click_rate,
    t.name as template_name,
    s.name as segment_name,
    u.email as created_by_email
FROM public.email_campaigns c
LEFT JOIN public.email_templates t ON c.template_id = t.id
LEFT JOIN public.customer_segments s ON c.segment_id = s.id
LEFT JOIN auth.users u ON c.created_by = u.id;

-- Grant access to the view
GRANT SELECT ON campaign_performance TO authenticated;

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, content, variables, category) VALUES
(
    'Welcome Email',
    'Welcome to Zetta Med - Your Journey to Quality Medical Equipment Starts Here',
    '<h1>Welcome {{customer_name}}!</h1><p>Thank you for joining Zetta Med. We''re excited to have you as part of our community.</p><p>As a trusted platform for refurbished medical equipment, we''re committed to providing you with:</p><ul><li>✓ High-quality, certified medical equipment</li><li>✓ Comprehensive warranties on all products</li><li>✓ Expert support and maintenance services</li><li>✓ Competitive prices with transparent pricing</li></ul><p><a href="{{browse_products_url}}" style="background: #00d4ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Browse Products</a></p>',
    ARRAY['{{customer_name}}', '{{browse_products_url}}'],
    'welcome'
),
(
    'Order Confirmation',
    'Order Confirmed - {{order_number}}',
    '<h1>Thank you for your order, {{customer_name}}!</h1><p>Your order #{{order_number}} has been confirmed and is being processed.</p><h2>Order Details:</h2>{{order_items}}<p><strong>Total: {{order_total}}</strong></p><p>You''ll receive another email when your order ships.</p><p><a href="{{track_order_url}}">Track Your Order</a></p>',
    ARRAY['{{customer_name}}', '{{order_number}}', '{{order_items}}', '{{order_total}}', '{{track_order_url}}'],
    'transactional'
),
(
    'Abandoned Cart Reminder',
    'You left something behind...',
    '<h1>Hi {{customer_name}},</h1><p>We noticed you left some items in your cart. These quality medical equipment items are still available:</p>{{cart_items}}<p>Complete your purchase now and enjoy:</p><ul><li>Free warranty on all products</li><li>Expert support</li><li>Secure payment options</li></ul><p><a href="{{cart_url}}" style="background: #ff0080; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Complete Your Order</a></p>',
    ARRAY['{{customer_name}}', '{{cart_items}}', '{{cart_url}}'],
    'abandoned_cart'
);