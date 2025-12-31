# Instructions to Fix Database Errors

## Overview

You're experiencing two related database errors:
1. **"new row violates row-level security policy for table 'orders'"** - The orders table is missing INSERT policies
2. **"Could not find a relationship between 'orders' and 'invoices' in the schema cache"** - The invoices table doesn't exist yet

## Solution

### Step 1: Apply the Migration

Run the migration script `10-fix-orders-and-add-invoices.sql` in your Supabase SQL Editor:

1. Open your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of `10-fix-orders-and-add-invoices.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

### Step 2: Verify the Changes

After running the migration, verify:

1. **Check the invoices table exists:**
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'invoices';
```

2. **Check RLS policies for orders table:**
```sql
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'orders';
```

You should see a new policy: "Users can create their own orders" with cmd = 'INSERT'

3. **Check foreign key relationships:**
```sql
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'invoices';
```

### Step 3: Clear PostgREST Schema Cache

PostgREST caches the database schema. After adding new tables, you need to reload it:

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to Settings → API
2. Click "Reload Schema" or "Restart Server"

**Option B: Via SQL (if available)**
```sql
NOTIFY pgrst, 'reload schema';
```

**Option C: Wait for automatic reload**
- PostgREST typically reloads the schema cache every few minutes

### Step 4: Test the Application

1. Try creating a new order - the RLS error should be gone
2. Navigate to the Orders page - the invoices relationship should now work

## What the Migration Does

### 1. Fixes RLS for Orders
- Adds INSERT policy allowing authenticated users to create orders where they are the buyer
- Adds admin policies for order_items and payments tables

### 2. Creates Invoices Table
- Creates the invoices table with proper structure
- Sets up foreign key relationships to orders, buyers, and sellers
- Adds RLS policies for viewing and managing invoices
- Creates indexes for performance

### 3. Automatic Invoice Generation
- Creates a trigger that automatically generates invoices when orders are paid
- Generates unique invoice numbers in format: INV-YYYYMM-XXXXX
- Prevents duplicate invoices with UNIQUE constraint on order_id

### 4. Enhanced Security
- Uses SECURITY DEFINER for trigger function to bypass RLS
- Adds ON CONFLICT handling to prevent duplicate invoices
- Ensures proper admin access to all tables

## Troubleshooting

### If you still see the relationship error:
1. Make sure the migration ran successfully (check for any error messages)
2. Wait 2-3 minutes for PostgREST to reload the schema cache
3. Try refreshing your browser and clearing the application cache

### If RLS errors persist:
1. Verify you're authenticated (check auth.uid() is not null)
2. Ensure the user_profiles table has a record for your user
3. Check that buyer_id in the order matches your auth.uid()

### To manually test invoice creation:
```sql
-- Simulate a paid order (replace IDs with actual values)
UPDATE orders 
SET payment_status = 'paid' 
WHERE id = 'your-order-id' 
AND payment_status != 'paid';

-- Check if invoice was created
SELECT * FROM invoices WHERE order_id = 'your-order-id';
```

## Additional Notes

- The invoices table is automatically managed by triggers
- Invoices are created when orders transition to 'paid' status
- Each order can only have one invoice (enforced by UNIQUE constraint)
- Invoice numbers are sequential per month and guaranteed unique