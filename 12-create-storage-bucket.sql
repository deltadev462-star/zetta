-- Create storage bucket for CMS media uploads
-- Run this in Supabase SQL Editor

-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for the media bucket

-- Allow public to view all media
CREATE POLICY "Public can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Allow authenticated users to upload media
CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update their own media
CREATE POLICY "Users can update own media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own media
CREATE POLICY "Users can delete own media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow admins to manage all media
CREATE POLICY "Admins can manage all media" ON storage.objects
  FOR ALL USING (
    bucket_id = 'media' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );