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

// Enhanced logging for debugging
console.log('🚀 Initializing Supabase with:', {
  url: supabaseUrl,
  isPlaceholder,
  environment: process.env.NODE_ENV
});

// Create a custom fetch wrapper with better error handling
const customFetch: typeof fetch = async (input, init) => {
  try {
    console.log('📡 Making request to:', input);
    const response = await fetch(input, init);
    
    if (!response.ok) {
      console.error('❌ Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        url: input
      });
    }
    
    return response;
  } catch (error) {
    console.error('🔥 Fetch error:', {
      error,
      url: input,
      headers: init?.headers,
      method: init?.method
    });
    
    // Check if it's a CORS error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('🚫 CORS Error - Possible causes:');
      console.error('1. Supabase project is paused or down');
      console.error('2. Network connectivity issues');
      console.error('3. CORS not properly configured');
      console.error('4. Invalid Supabase URL');
    }
    
    throw error;
  }
};

export const supabase = createClient(
  isPlaceholder ? 'https://placeholder.supabase.co' : supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      fetch: customFetch,
    },
  }
);

// Test the connection
const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('user_profiles').select('count(*)').limit(1);
    
    if (error) {
      console.error('❌ Supabase test query failed:', error);
    } else {
      console.log('✅ Supabase connection successful!');
    }
  } catch (err) {
    console.error('🔥 Critical Supabase connection error:', err);
  }
};

// Run test on load (only in development)
if (process.env.NODE_ENV === 'development') {
  testConnection();
}