import { supabase } from '../services/supabase';

export async function checkAndCreateMediaBucket() {
  try {
    console.log('Checking media bucket...');
    
    // First, check if we're authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    console.log('Authenticated as:', user.email);

    // Try to list buckets (this might fail due to permissions, but worth trying)
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.warn('Cannot list buckets (expected for non-admin users):', listError);
    } else if (buckets) {
      console.log('Available buckets:', buckets.map(b => b.name));
      const mediaBucket = buckets.find(b => b.name === 'media');
      if (mediaBucket) {
        console.log('Media bucket exists:', mediaBucket);
      } else {
        console.warn('Media bucket not found in list');
      }
    }

    // Try a test upload to see if the bucket is accessible
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    console.log('Attempting test upload...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(`test/${testFileName}`, testFile);

    if (uploadError) {
      console.error('Test upload failed:', uploadError);
      
      // Check specific error types
      const errorMessage = uploadError.message || '';
      const errorCode = (uploadError as any).statusCode || (uploadError as any).status;
      
      if (errorMessage.includes('not found') || errorCode === 404 || errorMessage.includes('Bucket not found')) {
        return {
          success: false,
          error: 'Media bucket does not exist. Please run the storage bucket creation SQL in your Supabase dashboard.'
        };
      } else if (errorMessage.includes('policy') || errorCode === 403 || errorMessage.includes('new row violates')) {
        return {
          success: false,
          error: 'Storage policies are not configured correctly. Please check the RLS policies for the media bucket.'
        };
      } else {
        return {
          success: false,
          error: `Storage error: ${uploadError.message}`
        };
      }
    }

    // If upload succeeded, clean up the test file
    if (uploadData?.path) {
      console.log('Test upload successful, cleaning up...');
      const { error: deleteError } = await supabase.storage
        .from('media')
        .remove([uploadData.path]);
      
      if (deleteError) {
        console.warn('Could not delete test file:', deleteError);
      }
    }

    return { success: true, message: 'Media bucket is properly configured!' };
  } catch (error: any) {
    console.error('Storage check error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error checking storage configuration' 
    };
  }
}

// SQL to create the bucket and policies (for reference)
export const CREATE_MEDIA_BUCKET_SQL = `
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
`;