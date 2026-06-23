import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../lib/LanguageContext';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const { t, lang, setLang } = useLanguage();
  const signOutLabel = lang === 'sv' ? 'Logga ut' : 'Log out';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settingsTitle')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('language')}</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langBtn, lang === 'sv' && styles.langBtnActive]}
            onPress={() => setLang('sv')}
          >
            <Text style={styles.langFlag}>🇸🇪</Text>
            <Text style={[styles.langText, lang === 'sv' && styles.langTextActive]}>
              {t('languageSwedish')}
            </Text>
            {lang === 'sv' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
            onPress={() => setLang('en')}
          >
            <Text style={styles.langFlag}>🇬🇧</Text>
            <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>
              {t('languageEnglish')}
            </Text>
            {lang === 'en' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('about')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{t('version')}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>🚪 {signOutLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', textAlign: 'center' },
  section: { margin: 16, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#999', textTransform: 'uppercase',
    letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  langRow: { flexDirection: 'column', paddingBottom: 8 },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    gap: 12,
  },
  langBtnActive: { backgroundColor: 'rgba(233,30,140,0.06)' },
  langFlag: { fontSize: 22 },
  langText: { flex: 1, fontSize: 16, color: '#1a1a2e', fontWeight: '500' },
  langTextActive: { color: '#e91e8c', fontWeight: '700' },
  checkmark: { fontSize: 16, color: '#e91e8c', fontWeight: '700' },
  infoRow: { paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  infoText: { fontSize: 15, color: '#999' },
  logoutBtn: {
    margin: 16, backgroundColor: '#fff', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#ffccdd',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#e91e8c' },
});
