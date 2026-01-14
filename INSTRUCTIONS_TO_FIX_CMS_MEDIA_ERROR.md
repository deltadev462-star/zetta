# Fix CMS Media Upload Error - Instructions

## Problem
The error "insert or update on table "cms_media" violates foreign key constraint" occurs because the `cms_media` table (and other CMS tables) have foreign keys that reference `user_profiles(id)`, but the application is trying to insert `auth.uid()` which comes from the `auth.users` table.

## Solution
I've created a database migration script that changes all foreign key constraints in CMS tables to reference `auth.users(id)` directly instead of `user_profiles(id)`.

## Steps to Apply the Fix

### 1. Apply the Database Migration

Run the following SQL script in your Supabase SQL Editor:

```bash
# The migration is in: fix-cms-media-foreign-key.sql
```

You can either:
- Copy the contents of `fix-cms-media-foreign-key.sql` and run it in the Supabase SQL Editor
- Or use the Supabase CLI if you have it configured

### 2. Verify the Changes

After applying the migration, verify that:
1. All foreign key constraints have been updated
2. The RLS policies are working correctly
3. User authentication is functioning properly

### 3. Test the Upload

Try uploading an image again through the CMS. It should now work without errors.

## What the Migration Does

1. **Updates Foreign Keys**: Changes all CMS table foreign keys from referencing `user_profiles(id)` to `auth.users(id)`
2. **Updates RLS Policies**: Ensures policies check `auth.uid()` directly
3. **Creates Auto-Profile Function**: Adds a trigger to automatically create user profiles when users sign up
4. **Maintains Data Integrity**: All existing data relationships are preserved

## Affected Tables

- `cms_media`
- `cms_hero_sections`
- `cms_services`
- `cms_brands`
- `cms_process_steps`
- `cms_featured_equipment`
- `cms_testimonials`
- `cms_site_settings`
- `cms_footer_sections`
- `cms_page_meta`

## Benefits

1. **Simpler Architecture**: No need to ensure user profiles exist before CMS operations
2. **Better Compatibility**: Works directly with Supabase Auth
3. **Fewer Errors**: Eliminates foreign key constraint violations
4. **Automatic Profile Creation**: User profiles are created automatically on signup

## Additional Notes

The `cms.ts` service code doesn't need to be changed - it's already using `user.id` from `auth.getUser()` which is correct. The issue was purely on the database schema side.

## Rollback (if needed)

If you need to rollback these changes, you would need to:
1. Change all foreign keys back to reference `user_profiles(id)`
2. Ensure all authenticated users have entries in the `user_profiles` table
3. Update the RLS policies accordingly

However, the new approach is more robust and recommended for production use.