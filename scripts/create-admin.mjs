// Usage:
//   npm run admin -- --email=user@example.com --password=TempPass123! --name="Zetta Admin"
// or set env vars:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME="..." npm run admin
//
// Required env:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Behavior:
// - Creates a Supabase Auth user (email confirmed) if not existing
// - Upserts public.user_profiles with role='admin' for that user

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [k, ...rest] = arg.slice(2).split('=');
      out[k] = rest.length ? rest.join('=') : true;
    }
  }
  return out;
}

function fail(msg) {
  console.error(`\n[admin] ${msg}\n`);
  process.exit(1);
}

async function main() {
  const {
    REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_NAME,
  } = process.env;

  const flags = parseArgs();
  const email = flags.email || ADMIN_EMAIL;
  const password = flags.password || ADMIN_PASSWORD;
  const fullName = flags.name || ADMIN_NAME || 'Zetta Admin';

  if (!REACT_APP_SUPABASE_URL || !REACT_APP_SUPABASE_SERVICE_ROLE_KEY) {
    fail(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in your environment (do NOT expose the service role key in the frontend).'
    );
  }
  if (!email || !password) {
    console.log('\nUsage:');
    console.log('  npm run admin -- --email=user@example.com --password=TempPass123! --name="Zetta Admin"\n');
    console.log('Or via env vars:');
    console.log('  ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME="..." npm run admin\n');
    fail('Missing --email and/or --password.');
  }

  const supabase = createClient(REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`[admin] Ensuring admin user exists for ${email} ...`);

  // Try creating the user
  let userId = null;
  let createErr = null;
  const createRes = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createRes.error) {
    createErr = createRes.error;
    // If user already exists, we will try to find them
    console.warn(`[admin] createUser returned: ${createErr.message}. Will attempt to find existing user by email.`);
  } else if (createRes.data?.user) {
    userId = createRes.data.user.id;
    console.log(`[admin] Created user with id: ${userId}`);
  }

  // If not created, list users and find by email
  if (!userId) {
    // listUsers returns paginated, attempt first 1000
    const list = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (list.error) {
      fail(`Failed to list users: ${list.error.message}`);
    }
    const found = list.data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!found) {
      fail(`User not found by email and could not create. Last error: ${createErr?.message || 'N/A'}`);
    }
    userId = found.id;
    console.log(`[admin] Found existing user id: ${userId}`);
  }

  // Upsert user_profiles with role=admin
  const upsert = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: userId,
        role: 'admin',
        full_name: fullName,
      },
      { onConflict: 'user_id' }
    )
    .select('user_id, role, full_name')
    .single();

  if (upsert.error) {
    fail(`Failed to upsert user_profiles: ${upsert.error.message}`);
  }

  console.log(`[admin] Upserted profile:`, upsert.data);

  // Double-check
  const verify = await supabase
    .from('user_profiles')
    .select('user_id, role, full_name')
    .eq('user_id', userId)
    .single();

  if (verify.error) {
    fail(`Failed to verify profile: ${verify.error.message}`);
  }

  if (verify.data?.role !== 'admin') {
    fail(`Profile role is not 'admin' after upsert. Current role: ${verify.data?.role}`);
  }

  console.log(`\n[admin] Success. ${email} is now an admin.`);
  console.log(`[admin] Name: ${verify.data.full_name} | User ID: ${verify.data.user_id}\n`);
}

main().catch((err) => {
  console.error('[admin] Unexpected error:', err);
  process.exit(1);
});