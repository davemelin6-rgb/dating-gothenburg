import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
// @ts-ignore — internal expo-router head module
import { Head } from 'expo-router/build/head/ExpoHead';
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
    <Head.Provider>
      <LanguageProvider>
        <Head>
          <title>Match GBG – Bästa dejtingappen i Göteborg</title>
          <meta name="description" content="Match GBG är Göteborgs bästa dejtingapp. Hitta kärlek och dejter i Göteborg. The best dating app in Gothenburg, Sweden." />
          <meta name="keywords" content="dejting göteborg, dating göteborg, bästa dejtingapp, dating gothenburg, dating sweden, match gbg, kärlek göteborg" />
          <meta name="theme-color" content="#e91e8c" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://matchgbg.se" />
          <meta property="og:title" content="Match GBG – Bästa dejtingappen i Göteborg ❤️" />
          <meta property="og:description" content="Hitta din match i Göteborg. Gratis att komma igång!" />
          <meta property="og:image" content="https://matchgbg.se/og-image.svg" />
          <meta property="og:locale" content="sv_SE" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Match GBG – Bästa dejtingappen i Göteborg ❤️" />
          <meta name="twitter:description" content="Hitta din match i Göteborg. Gratis att komma igång!" />
          <meta name="twitter:image" content="https://matchgbg.se/og-image.svg" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        </Head>
        <GestureHandlerRootView style={styles.root}>
          <Stack screenOptions={{ headerShown: false }} />
          <AuthGate />
        </GestureHandlerRootView>
      </LanguageProvider>
    </Head.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
