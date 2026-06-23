import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useLanguage } from '../../lib/LanguageContext';
import { supabase } from '../../lib/supabase';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (isDesktop) {
    return (
      <View style={[styles.iconWrapDesktop, focused && styles.iconFocused]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.labelDesktop, focused && styles.labelFocused]} numberOfLines={1} ellipsizeMode="tail">{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.iconWrapMobile}>
      <Text style={styles.emojiMobile}>{emoji}</Text>
      <Text style={[styles.labelMobile, focused && styles.labelMobileFocused]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t, lang } = useLanguage();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isDesktop ? styles.tabBarWeb : styles.tabBarMobile,
        tabBarShowLabel: false,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" label={t('discover')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💬" label={t('messages')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎉" label={t('events')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label={t('profile')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👑" label="Premium" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label={t('settings')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="logout"
        listeners={{ tabPress: (e) => { e.preventDefault(); supabase.auth.signOut(); } }}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚪" label={lang === 'sv' ? 'Logga ut' : 'Log out'} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarMobile: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    height: 72,
    paddingBottom: 8,
  },
  tabBarWeb: {
    backgroundColor: '#1a1a2e',
    borderRightWidth: 0,
    width: 200,
    paddingTop: 24,
    paddingHorizontal: 12,
  },
  iconWrapDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  iconWrapMobile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
    minWidth: 48,
  },
  iconFocused: {
    backgroundColor: 'rgba(233,30,140,0.15)',
  },
  emoji: { fontSize: 22 },
  emojiMobile: { fontSize: 22 },
  labelDesktop: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
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
  },
  labelMobileFocused: {
    color: '#e91e8c',
    fontWeight: '700',
  },
});
