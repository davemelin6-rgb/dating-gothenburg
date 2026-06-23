import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useLanguage } from '../../lib/LanguageContext';
import { supabase } from '../../lib/supabase';

export default function TabsLayout() {
  const { t, lang } = useLanguage();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 700;

  const icon = (emoji: string) =>
    ({ focused }: { focused: boolean }) => (
      <View style={[styles.iconWrap, focused && isDesktop && styles.iconFocused]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarStyle: isDesktop ? styles.tabBarDesktop : styles.tabBarMobile,
        tabBarLabelStyle: isDesktop ? styles.labelDesktop : styles.labelMobile,
        tabBarActiveTintColor: isDesktop ? '#fff' : '#e91e8c',
        tabBarInactiveTintColor: isDesktop ? 'rgba(255,255,255,0.5)' : '#999',
        tabBarItemStyle: isDesktop ? styles.tabItemDesktop : styles.tabItemMobile,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: icon('🔥'), tabBarLabel: t('discover') }} />
      <Tabs.Screen name="matches" options={{ tabBarIcon: icon('💬'), tabBarLabel: t('messages') }} />
      <Tabs.Screen name="events" options={{ tabBarIcon: icon('🎉'), tabBarLabel: t('events') }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: icon('👤'), tabBarLabel: t('profile') }} />
      <Tabs.Screen name="premium" options={{ tabBarIcon: icon('👑'), tabBarLabel: 'Premium' }} />
      <Tabs.Screen name="settings" options={{ tabBarIcon: icon('⚙️'), tabBarLabel: t('settings') }} />
      <Tabs.Screen
        name="logout"
        listeners={{ tabPress: (e) => { e.preventDefault(); supabase.auth.signOut(); } }}
        options={{ tabBarIcon: icon('🚪'), tabBarLabel: lang === 'sv' ? 'Logga ut' : 'Log out' }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarDesktop: {
    backgroundColor: '#1a1a2e',
    width: 200,
    paddingTop: 16,
    paddingHorizontal: 8,
    borderRightWidth: 0,
  },
  tabBarMobile: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    height: 72,
    paddingBottom: 8,
  },
  tabItemDesktop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    height: 48,
    borderRadius: 12,
    marginVertical: 2,
  },
  tabItemMobile: {
    paddingTop: 4,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFocused: {
    // highlight handled by tabBarActiveTintColor
  },
  emoji: { fontSize: 20 },
  labelDesktop: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  labelMobile: {
    fontSize: 10,
    marginTop: 2,
  },
});
