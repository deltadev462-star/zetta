-- Fix CMS Media Foreign Key Constraint
-- This script fixes the foreign key issue with cms_media table

-- Option 1: Change the foreign key to reference auth.users directly
-- This is simpler and ensures any authenticated user can upload media

-- First, drop the existing constraint
ALTER TABLE cms_media DROP CONSTRAINT IF EXISTS cms_media_uploaded_by_fkey;

-- Add new constraint referencing auth.users instead of user_profiles
ALTER TABLE cms_media 
ADD CONSTRAINT cms_media_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies for cms_media
DROP POLICY IF EXISTS "Authenticated users can upload media" ON cms_media;
DROP POLICY IF EXISTS "Users can manage their own media" ON cms_media;

-- Create updated policies
CREATE POLICY "Authenticated users can upload media" ON cms_media
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can manage their own media" ON cms_media
    FOR UPDATE USING (uploaded_by = auth.uid());

-- Also fix other CMS tables that have similar issues
-- These tables also reference user_profiles but should reference auth.users

-- Fix cms_hero_sections
ALTER TABLE cms_hero_sections DROP CONSTRAINT IF EXISTS cms_hero_sections_created_by_fkey;
ALTER TABLE cms_hero_sections DROP CONSTRAINT IF EXISTS cms_hero_sections_updated_by_fkey;

ALTER TABLE cms_hero_sections 
ADD CONSTRAINT cms_hero_sections_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE cms_hero_sections 
ADD CONSTRAINT cms_hero_sections_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix cms_services
ALTER TABLE cms_services DROP CONSTRAINT IF EXISTS cms_services_created_by_fkey;
ALTER TABLE cms_services DROP CONSTRAINT IF EXISTS cms_services_updated_by_fkey;

ALTER TABLE cms_services 
ADD CONSTRAINT cms_services_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE cms_services 
ADD CONSTRAINT cms_services_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix cms_brands
ALTER TABLE cms_brands DROP CONSTRAINT IF EXISTS cms_brands_created_by_fkey;
ALTER TABLE cms_brands DROP CONSTRAINT IF EXISTS cms_brands_updated_by_fkey;

ALTER TABLE cms_brands 
ADD CONSTRAINT cms_brands_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE cms_brands 
ADD CONSTRAINT cms_brands_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix cms_process_steps
ALTER TABLE cms_process_steps DROP CONSTRAINT IF EXISTS cms_process_steps_created_by_fkey;
ALTER TABLE cms_process_steps DROP CONSTRAINT IF EXISTS cms_process_steps_updated_by_fkey;

ALTER TABLE cms_process_steps 
ADD CONSTRAINT cms_process_steps_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE cms_process_steps 
ADD CONSTRAINT cms_process_steps_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix cms_featured_equipment
ALTER TABLE cms_featured_equipment DROP CONSTRAINT IF EXISTS cms_featured_equipment_created_by_fkey;
ALTER TABLE cms_featured_equipment DROP CONSTRAINT IF EXISTS cms_featured_equipment_updated_by_fkey;

ALTER TABLE cms_featured_equipment 
ADD CONSTRAINT cms_featured_equipment_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE cms_featured_equipment 
ADD CONSTRAINT cms_featured_equipment_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix cms_testimonials
ALTER TABLE cms_testimonials DROP CONSTRAINT IF EXISTS cms_testimonials_created_by_fkey;
ALTER TABLE cms_testimonials DROP CONSTRAINT IF EXISTS cms_testimonials_updated_by_fkey;

ALTER TABLE cms_testimonials 
ADD CONSTRAINT cms_testimonials_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE cms_testimonials 
ADD CONSTRAINT cms_testimonials_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix cms_site_settings
ALTER TABLE cms_site_settings DROP CONSTRAINT IF EXISTS cms_site_settings_updated_by_fkey;

ALTER TABLE cms_site_settings 
ADD CONSTRAINT cms_site_settings_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix cms_footer_sections
ALTER TABLE cms_footer_sections DROP CONSTRAINT IF EXISTS cms_footer_sections_created_by_fkey;
ALTER TABLE cms_footer_sections DROP CONSTRAINT IF EXISTS cms_footer_sections_updated_by_fkey;

ALTER TABLE cms_footer_sections 
ADD CONSTRAINT cms_footer_sections_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE cms_footer_sections 
ADD CONSTRAINT cms_footer_sections_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix cms_page_meta
ALTER TABLE cms_page_meta DROP CONSTRAINT IF EXISTS cms_page_meta_updated_by_fkey;

ALTER TABLE cms_page_meta 
ADD CONSTRAINT cms_page_meta_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create a function to ensure user profiles exist for authenticated users
-- This is optional but can help maintain consistency
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if profile exists
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = NEW.id) THEN
        -- Create a basic profile
        INSERT INTO user_profiles (user_id, role)
        VALUES (NEW.id, 'buyer');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create user profiles on signup
DROP TRIGGER IF EXISTS create_user_profile_on_signup ON auth.users;
CREATE TRIGGER create_user_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION ensure_user_profile();

-- Update all RLS policies to check auth.uid() directly instead of checking user_profiles table
-- This makes the system more flexible and avoids the foreign key issues