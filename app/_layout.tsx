import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { LanguageProvider } from '../lib/LanguageContext';
import type { Session } from '@supabase/supabase-js';

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === '(auth)';
    if (session && inAuth) {
      router.replace('/(tabs)');
    } else if (!session && !inAuth) {
      router.replace('/(auth)/login');
    }
  }, [session, ready, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <GestureHandlerRootView style={styles.root}>
        <Stack screenOptions={{ headerShown: false }} />
        <AuthGate />
      </GestureHandlerRootView>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
