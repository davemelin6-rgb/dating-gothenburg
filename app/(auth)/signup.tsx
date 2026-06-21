import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name || !age || !email || !password) {
      Alert.alert('Please fill in all fields');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      Alert.alert('You must be 18 or older to use Dating Gothenburg');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      Alert.alert('Sign up failed', error.message);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        age: ageNum,
        bio: '',
        avatar_url: null,
      });
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Dating Gothenburg</Text>
        <Text style={styles.tagline}>Create your profile</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="#999"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            maxLength={2}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  logo: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  button: {
    backgroundColor: '#e91e8c',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
  linkText: {
    color: '#e91e8c',
    fontSize: 15,
    fontWeight: '600',
  },
});
