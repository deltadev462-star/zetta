import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mkrmmtoynheakxkigqio.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rcm1tdG95bmhlYWt4a2lncWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTgyMTksImV4cCI6MjA3ODg3NDIxOX0.j93HZ5gHbUmYqaJvzjZzMaXgUaQ4TlFUP14_rtw-Zx8';

// Check if we're using placeholder values
const isPlaceholder = supabaseUrl === 'https://placeholder.supabase.co' ||
                     supabaseUrl === 'your_supabase_project_url' ||
                     !supabaseUrl.startsWith('http');

if (isPlaceholder) {
  console.warn(
    '⚠️ Supabase is not configured! Please update your .env file with actual Supabase credentials.\n' +
    'You can create a free project at https://supabase.com'
  );
}

export const supabase = createClient(
  isPlaceholder ? 'https://placeholder.supabase.co' : supabaseUrl,
  supabaseAnonKey
);