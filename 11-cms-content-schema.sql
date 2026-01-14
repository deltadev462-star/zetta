-- CMS Content Management Schema
-- This schema allows admin users to manage all landing page content dynamically

-- Table for managing hero/banner sections
CREATE TABLE cms_hero_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_text VARCHAR(255),
    cta_link VARCHAR(500),
    background_image VARCHAR(500),
    gradient_start VARCHAR(7) DEFAULT '#00d4ff',
    gradient_end VARCHAR(7) DEFAULT '#ff0080',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Table for managing services section
CREATE TABLE cms_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    icon_name VARCHAR(100) NOT NULL, -- Material UI icon name
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    gradient_start VARCHAR(7) NOT NULL,
    gradient_end VARCHAR(7) NOT NULL,
    shadow_color VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Table for managing brands
CREATE TABLE cms_brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500) NOT NULL,
    website_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Table for managing process steps
CREATE TABLE cms_process_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    icon_name VARCHAR(100) NOT NULL, -- Material UI icon name
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    color VARCHAR(7) NOT NULL,
    highlight_text VARCHAR(500),
    step_number INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Table for managing featured equipment (products showcase)
CREATE TABLE cms_featured_equipment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    title_override VARCHAR(255), -- Optional custom title
    description_override TEXT, -- Optional custom description
    is_featured BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    custom_badge VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Table for managing customer testimonials
CREATE TABLE cms_testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_title VARCHAR(255),
    customer_company VARCHAR(255),
    customer_image VARCHAR(500),
    testimonial_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Table for general site settings
CREATE TABLE cms_site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'boolean', 'json', 'image'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Table for managing footer content
CREATE TABLE cms_footer_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_title VARCHAR(255) NOT NULL,
    section_type VARCHAR(50) NOT NULL, -- 'links', 'contact', 'social', 'newsletter'
    content JSONB NOT NULL, -- Flexible content storage
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Table for managing page SEO metadata
CREATE TABLE cms_page_meta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_slug VARCHAR(255) UNIQUE NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    og_image VARCHAR(500),
    keywords TEXT[],
    custom_meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Table for managing image uploads
CREATE TABLE cms_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    alt_text VARCHAR(500),
    caption TEXT,
    folder VARCHAR(100) DEFAULT 'general',
    uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cms_hero_active ON cms_hero_sections(is_active);
CREATE INDEX idx_cms_services_active ON cms_services(is_active);
CREATE INDEX idx_cms_brands_active ON cms_brands(is_active);
CREATE INDEX idx_cms_process_active ON cms_process_steps(is_active);
CREATE INDEX idx_cms_featured_active ON cms_featured_equipment(is_featured);
CREATE INDEX idx_cms_testimonials_active ON cms_testimonials(is_active);
CREATE INDEX idx_cms_footer_active ON cms_footer_sections(is_active);
CREATE INDEX idx_cms_media_folder ON cms_media(folder);

-- Enable RLS for all CMS tables
ALTER TABLE cms_hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_featured_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read, admin write
-- Hero Sections
CREATE POLICY "Public can view active hero sections" ON cms_hero_sections
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage hero sections" ON cms_hero_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Services
CREATE POLICY "Public can view active services" ON cms_services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON cms_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Brands
CREATE POLICY "Public can view active brands" ON cms_brands
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage brands" ON cms_brands
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Process Steps
CREATE POLICY "Public can view active process steps" ON cms_process_steps
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage process steps" ON cms_process_steps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Featured Equipment
CREATE POLICY "Public can view featured equipment" ON cms_featured_equipment
    FOR SELECT USING (is_featured = true);

CREATE POLICY "Admins can manage featured equipment" ON cms_featured_equipment
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Testimonials
CREATE POLICY "Public can view active testimonials" ON cms_testimonials
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" ON cms_testimonials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Site Settings
CREATE POLICY "Public can view site settings" ON cms_site_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON cms_site_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Footer Sections
CREATE POLICY "Public can view active footer sections" ON cms_footer_sections
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage footer sections" ON cms_footer_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Page Meta
CREATE POLICY "Public can view page meta" ON cms_page_meta
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage page meta" ON cms_page_meta
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Media
CREATE POLICY "Public can view media" ON cms_media
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload media" ON cms_media
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own media" ON cms_media
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Admins can delete media" ON cms_media
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Create update trigger for timestamp
CREATE OR REPLACE FUNCTION update_cms_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all CMS tables
CREATE TRIGGER update_cms_hero_timestamp BEFORE UPDATE ON cms_hero_sections
    FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_services_timestamp BEFORE UPDATE ON cms_services
    FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_brands_timestamp BEFORE UPDATE ON cms_brands
    FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_process_timestamp BEFORE UPDATE ON cms_process_steps
    FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_featured_timestamp BEFORE UPDATE ON cms_featured_equipment
    FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_testimonials_timestamp BEFORE UPDATE ON cms_testimonials
    FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_site_settings_timestamp BEFORE UPDATE ON cms_site_settings
    FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_footer_timestamp BEFORE UPDATE ON cms_footer_sections
    FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_page_meta_timestamp BEFORE UPDATE ON cms_page_meta
    FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

-- Insert default data
-- Services
INSERT INTO cms_services (icon_name, title, description, gradient_start, gradient_end, shadow_color, display_order) VALUES
('LocalShipping', 'Delivery', 'Fast and secure delivery to your location', '#667eea', '#764ba2', 'rgba(102, 126, 234, 0.4)', 1),
('VerifiedUser', 'Warranty', 'Comprehensive warranty coverage for all products', '#00d4ff', '#0099cc', 'rgba(0, 212, 255, 0.4)', 2),
('AccountBalance', 'Flexible Financing', 'Various payment options to suit your needs', '#f093fb', '#f5576c', 'rgba(245, 87, 108, 0.4)', 3);

-- Process Steps
INSERT INTO cms_process_steps (icon_name, title, description, color, highlight_text, step_number) VALUES
('Search', 'Discover Equipment', 'Browse our extensive catalog of medical equipment', '#00d4ff', 'Find the perfect equipment for your needs', 1),
('Shield', 'Quality Assurance', 'All equipment undergoes rigorous quality checks', '#00ff88', '100% certified and tested equipment', 2),
('Handshake', 'Connect with Sellers', 'Direct communication with verified suppliers', '#ff0080', 'Transparent pricing and negotiations', 3),
('LocalShipping', 'Logistics Support', 'We handle shipping and delivery logistics', '#ffaa00', 'Track your order in real-time', 4),
('Support', 'After-Sales Support', 'Comprehensive support and maintenance services', '#00d4ff', '24/7 customer support available', 5);

-- Default site settings
INSERT INTO cms_site_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', '{"value": "Zetta Med Platform"}', 'text', 'Website name'),
('primary_color', '{"value": "#00d4ff"}', 'text', 'Primary brand color'),
('secondary_color', '{"value": "#ff0080"}', 'text', 'Secondary brand color'),
('contact_email', '{"value": "contact@zettamed.com"}', 'text', 'Contact email address'),
('contact_phone', '{"value": "+1234567890"}', 'text', 'Contact phone number');