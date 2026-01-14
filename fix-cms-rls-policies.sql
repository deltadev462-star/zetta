-- Fix CMS RLS Policies
-- This script adds more permissive policies for development/testing

-- First, drop existing restrictive policies
DROP POLICY IF EXISTS "Public can view active hero sections" ON cms_hero_sections;
DROP POLICY IF EXISTS "Admins can manage hero sections" ON cms_hero_sections;
DROP POLICY IF EXISTS "Public can view active services" ON cms_services;
DROP POLICY IF EXISTS "Admins can manage services" ON cms_services;
DROP POLICY IF EXISTS "Public can view active brands" ON cms_brands;
DROP POLICY IF EXISTS "Admins can manage brands" ON cms_brands;

-- Create more permissive policies for development
-- Hero Sections
CREATE POLICY "Public can view all hero sections" ON cms_hero_sections
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage hero sections" ON cms_hero_sections
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Services
CREATE POLICY "Public can view all services" ON cms_services
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage services" ON cms_services
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Brands
CREATE POLICY "Public can view all brands" ON cms_brands
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage brands" ON cms_brands
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Alternative: If you want to keep admin-only access but make it work properly
-- Make sure you have an admin user first by running:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Or temporarily disable RLS for testing (NOT recommended for production):
-- ALTER TABLE cms_hero_sections DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE cms_services DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE cms_brands DISABLE ROW LEVEL SECURITY;

-- To check current user role:
-- SELECT id, email, role FROM user_profiles WHERE id = auth.uid();