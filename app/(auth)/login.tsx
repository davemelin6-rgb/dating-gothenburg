import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/LanguageContext';

export default function LoginScreen() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin() {
    setErrorMsg('');
    if (!email || !password) { setErrorMsg(t('fillInFields')); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('credentials')) {
        setErrorMsg(t('incorrectCredentials'));
      } else {
        setErrorMsg(error.message);
      }
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.logo}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder={t('email')} placeholderTextColor="#999"
            value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder={t('password')} placeholderTextColor="#999"
            value={password} onChangeText={setPassword} secureTextEntry />

          {errorMsg ? (
            <View style={styles.errorBox}><Text style={styles.errorText}>{errorMsg}</Text></View>
          ) : null}

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? t('signingIn') : t('signIn')}</Text>
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>
        </Link>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('noAccount')} </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity><Text style={styles.linkText}>{t('signUp')}</Text></TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logo: { fontSize: 34, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 48 },
  form: { gap: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  button: { backgroundColor: '#e91e8c', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  forgotWrap: { alignItems: 'center', marginTop: 8 },
  forgotText: { color: 'rgba(255,255,255,0.45)', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  linkText: { color: '#e91e8c', fontSize: 15, fontWeight: '600' },
  errorBox: { backgroundColor: 'rgba(244,67,54,0.15)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(244,67,54,0.4)' },
  errorText: { color: '#ff6b6b', fontSize: 14, textAlign: 'center' },
});
