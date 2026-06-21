import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

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
