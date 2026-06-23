import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/LanguageContext';

export default function ForgotPasswordScreen() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    setError('');
    if (!email) { setError(t('fillInFields')); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://matchgbg.se',
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.title}>{t('forgotPasswordTitle')}</Text>
        <Text style={styles.sub}>{t('forgotPasswordSub')}</Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ {t('resetSent')}</Text>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder={t('email')}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleReset} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? t('sending') : t('sendResetLink')}</Text>
            </TouchableOpacity>
          </>
        )}

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.backWrap}>
            <Text style={styles.backText}>← {t('backToLogin')}</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12 },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 16 },
  button: { backgroundColor: '#e91e8c', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  errorBox: { backgroundColor: 'rgba(244,67,54,0.15)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(244,67,54,0.4)', marginBottom: 16 },
  errorText: { color: '#ff6b6b', fontSize: 14, textAlign: 'center' },
  successBox: { backgroundColor: 'rgba(76,175,80,0.15)', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: 'rgba(76,175,80,0.4)', marginBottom: 24 },
  successText: { color: '#81c784', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  backWrap: { alignItems: 'center', marginTop: 28 },
  backText: { color: 'rgba(255,255,255,0.45)', fontSize: 14 },
});
