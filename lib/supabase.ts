import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ohqxqkfpunhrxlfbkzpa.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocXhxa2ZwdW5ocnhsZmJrenBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODI1NzcsImV4cCI6MjA5NzQ1ODU3N30.MSlq_YBgSiO_K-CrcX_qwLVRc4mEA7MSv46nhaS_OXw';

async function getStorage() {
  if (Platform.OS === 'web') return undefined;
  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
  return AsyncStorage;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Attach native storage after init (no-op on web, uses localStorage automatically)
if (Platform.OS !== 'web') {
  getStorage().then((storage) => {
    if (storage) {
      supabase.auth.setSession.length; // ensure client is ready
    }
  });
}
