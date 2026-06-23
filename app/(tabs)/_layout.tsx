import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useLanguage } from '../../lib/LanguageContext';
import { supabase } from '../../lib/supabase';

function TabIcon({ emoji, label, focused, isDesktop }: { emoji: string; label: string; focused: boolean; isDesktop: boolean }) {
  return (
    <View style={[isDesktop ? styles.iconWrapDesktop : styles.iconWrapMobile, focused && isDesktop && styles.iconFocused]}>
      <Text style={isDesktop ? styles.emoji : styles.emojiMobile}>{emoji}</Text>
      {isDesktop && (
        <Text style={[styles.label, focused && styles.labelFocused]} numberOfLines={1}>{label}</Text>
      )}
      {!isDesktop && (
        <Text style={[styles.labelMobile, focused && styles.labelMobileFocused]} numberOfLines={1}>{label}</Text>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { t, lang } = useLanguage();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 700;

  const icon = (emoji: string, label: string) =>
    ({ focused }: { focused: boolean }) =>
      <TabIcon emoji={emoji} label={label} focused={focused} isDesktop={isDesktop} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isDesktop ? styles.tabBarDesktop : styles.tabBarMobile,
        tabBarShowLabel: false,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: icon('🔥', t('discover')) }} />
      <Tabs.Screen name="matches" options={{ tabBarIcon: icon('💬', t('messages')) }} />
      <Tabs.Screen name="events" options={{ tabBarIcon: icon('🎉', t('events')) }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: icon('👤', t('profile')) }} />
      <Tabs.Screen name="premium" options={{ tabBarIcon: icon('👑', 'Premium') }} />
      <Tabs.Screen name="settings" options={{ tabBarIcon: icon('⚙️', t('settings')) }} />
      <Tabs.Screen
        name="logout"
        listeners={{ tabPress: (e) => { e.preventDefault(); supabase.auth.signOut(); } }}
        options={{ tabBarIcon: icon('🚪', lang === 'sv' ? 'Logga ut' : 'Log out') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarDesktop: {
    backgroundColor: '#1a1a2e',
    borderRightWidth: 0,
    width: 220,
    paddingTop: 24,
    paddingHorizontal: 12,
  },
  tabBarMobile: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    height: 72,
    paddingBottom: 8,
  },
  iconWrapDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    overflow: 'hidden',
  },
  iconWrapMobile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconFocused: {
    backgroundColor: 'rgba(233,30,140,0.15)',
  },
  emoji: { fontSize: 20 },
  emojiMobile: { fontSize: 22 },
  label: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  labelFocused: {
    color: '#fff',
    fontWeight: '700',
  },
  labelMobile: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
  labelMobileFocused: {
    color: '#e91e8c',
    fontWeight: '700',
  },
});
