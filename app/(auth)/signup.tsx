import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/LanguageContext';

const GENDER_OPTIONS = [
  { sv: 'Man', en: 'Man', value: 'Man' },
  { sv: 'Kvinna', en: 'Woman', value: 'Woman' },
  { sv: 'Annat', en: 'Other', value: 'Other' },
];

export default function SignupScreen() {
  const { lang } = useLanguage();
  const sv = lang === 'sv';

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSignup() {
    setErrorMsg('');
    if (!name || !age || !gender || !email || !password) {
      setErrorMsg(sv ? 'Fyll i alla fält.' : 'Please fill in all fields.');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      setErrorMsg(sv ? 'Du måste vara minst 18 år.' : 'You must be at least 18 years old.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(sv ? 'Lösenordet måste vara minst 6 tecken.' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, age: ageNum, gender },
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      setLoading(false);
      setErrorMsg(error.message);
      return;
    }

    // Upsert profile with gender — trigger handles the insert but we add gender here
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        age: ageNum,
        gender,
        bio: '',
        pref_gender: 'Everyone',
        pref_min_age: 18,
        pref_max_age: 99,
      });
    }

    setLoading(false);

    if (!data.session) {
      // Email confirmation required — tell user to check inbox
      setErrorMsg(
        sv
          ? 'Kontrollera din e-post och klicka på bekräftelselänken för att aktivera ditt konto.'
          : 'Check your email and click the confirmation link to activate your account.'
      );
    }
    // If session exists, AuthGate in _layout.tsx will auto-redirect to tabs
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>{sv ? 'Match GBG' : 'Match GBG'}</Text>
        <Text style={styles.tagline}>{sv ? 'Skapa ditt konto' : 'Create your account'}</Text>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder={sv ? 'Ditt namn' : 'Your name'}
            placeholderTextColor="#999" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder={sv ? 'Ålder' : 'Age'}
            placeholderTextColor="#999" value={age} onChangeText={setAge}
            keyboardType="numeric" maxLength={2} />

          <Text style={styles.genderLabel}>{sv ? 'Jag är' : 'I am a'}</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.genderBtn, gender === g.value && styles.genderBtnActive]}
                onPress={() => setGender(g.value)}
              >
                <Text style={[styles.genderText, gender === g.value && styles.genderTextActive]}>
                  {sv ? g.sv : g.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput style={styles.input} placeholder={sv ? 'E-post' : 'Email'}
            placeholderTextColor="#999" value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder={sv ? 'Lösenord (minst 6 tecken)' : 'Password (min 6 characters)'}
            placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry />

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? (sv ? 'Skapar konto...' : 'Creating account...') : (sv ? 'Skapa konto' : 'Create Account')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{sv ? 'Har du redan ett konto? ' : 'Already have an account? '}</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>{sv ? 'Logga in' : 'Sign In'}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 60 },
  logo: { fontSize: 34, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 40 },
  form: { gap: 14 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  genderLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' },
  genderBtnActive: { backgroundColor: '#e91e8c', borderColor: '#e91e8c' },
  genderText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  genderTextActive: { color: '#fff' },
  errorBox: { backgroundColor: 'rgba(244,67,54,0.15)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(244,67,54,0.4)' },
  errorText: { color: '#ff6b6b', fontSize: 14, textAlign: 'center' },
  button: { backgroundColor: '#e91e8c', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  linkText: { color: '#e91e8c', fontSize: 15, fontWeight: '600' },
});
