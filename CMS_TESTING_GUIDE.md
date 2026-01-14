# CMS Testing Guide

## Overview
The Content Management System (CMS) has been successfully implemented with the following features:

### 1. Database Schema ✅
- Created comprehensive schema for all content types
- Implemented Row Level Security (RLS) policies
- Set up real-time subscriptions

### 2. Admin Dashboard Access
Navigate to: `http://localhost:3000/admin/cms`

### 3. Implemented Features

#### Hero Sections Management
- Create, edit, and delete hero/banner sections
- Upload background images
- Customize gradient colors
- Set active/inactive status
- Control display order

#### Services Management
- Add services with icons and descriptions
- Customize gradient colors and shadows
- Toggle active status
- Manage display order

#### Brands Management  
- Add brand partners with logos
- Upload brand images
- Add website URLs and descriptions
- Control visibility

### 4. Dynamic Landing Page Updates
The following components now fetch data from the CMS:
- `Services.tsx` - Displays services from cms_services table
- `OurBrands.tsx` - Shows brand partners from cms_brands table
- `OurProcess.tsx` - Displays process steps from cms_process_steps table

### 5. Real-time Updates
All changes made in the CMS are immediately reflected on the landing page through Supabase real-time subscriptions.

## Testing Steps

1. **Access the CMS**
   - Login as an admin user
   - Navigate to `/admin/cms` or click "Content Management" from the admin dashboard

2. **Test Hero Sections**
   - Click on "Hero Sections" tab
   - Add a new hero section with:
     - Title: "Welcome to Zetta Med"
     - Subtitle: "Your trusted medical equipment partner"
     - CTA Text: "Shop Now"
     - CTA Link: "/products"
     - Upload a background image
     - Set gradient colors
   - Save and verify it appears in the list
   - Edit the hero section and change some values
   - Delete a test hero section

3. **Test Services**
   - Click on "Services" tab
   - Add a new service with:
     - Icon Name: "LocalShipping"
     - Title: "Fast Delivery"
     - Description: "Quick and reliable delivery service"
     - Customize colors
   - Navigate to the landing page and verify the service appears
   - Edit and delete services to test all CRUD operations

4. **Test Brands**
   - Click on "Brands" tab
   - Add brand partners with logos
   - Upload brand images using the image upload component
   - Check that brands appear on the landing page

5. **Test Real-time Updates**
   - Open the landing page in one browser tab
   - Open the CMS in another tab
   - Make changes in the CMS
   - Verify changes appear immediately on the landing page without refresh

## Image Upload Testing
- Drag and drop images or click to browse
- Supports JPG, PNG, GIF, WebP formats
- Maximum file size: 5MB
- Images are automatically uploaded to Supabase storage

## Pending Features (Coming Soon)
- Process Steps management
- Featured Equipment management
- Testimonials management
- Site Settings management
- Footer content management
- Page metadata management

## Troubleshooting

If you encounter issues:

1. **Database Connection**
   - Ensure Supabase is configured correctly
   - Check that RLS policies are enabled
   - Verify the storage bucket exists

2. **Image Uploads**
   - Confirm the 'cms-media' bucket exists in Supabase
   - Check bucket policies allow public viewing
   - Ensure authenticated users can upload

3. **Real-time Updates Not Working**
   - Check browser console for WebSocket errors
   - Verify Supabase real-time is enabled for tables
   - Ensure you're logged in with proper permissions