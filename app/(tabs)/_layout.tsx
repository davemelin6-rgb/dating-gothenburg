import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useLanguage } from '../../lib/LanguageContext';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  return (
    <View style={[styles.iconWrap, focused && styles.iconFocused, !isDesktop && styles.iconWrapMobile]}>
      <Text style={[styles.emoji, !isDesktop && styles.emojiMobile]}>{emoji}</Text>
      {isDesktop && (
        <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useLanguage();
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
  iconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  iconWrapMobile: {
    flexDirection: 'column',
    paddingHorizontal: 4,
    paddingVertical: 6,
    gap: 2,
    width: 'auto',
  },
  emojiMobile: {
    fontSize: 26,
  },
  iconFocused: {
    backgroundColor: 'rgba(233,30,140,0.15)',
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },
  labelFocused: {
    color: '#fff',
    fontWeight: '700',
  },
});
