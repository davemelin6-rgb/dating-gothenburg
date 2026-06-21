import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/LanguageContext';

type ProfileData = {
  name: string;
  age: string;
  bio: string;
  avatar_url: string | null;
  gender: string;
  // Partner preferences
  pref_min_age: string;
  pref_max_age: string;
  pref_gender: string;
  interests: string[];
};

const MY_GENDER_KEYS = ['man', 'woman', 'other'] as const;
const PREF_GENDER_KEYS = ['women', 'men', 'everyone'] as const;
const MY_GENDER_VALUES = ['Man', 'Woman', 'Other'];
const PREF_GENDER_VALUES = ['Women', 'Men', 'Everyone'];

const INTEREST_OPTIONS = [
  'Coffee', 'Hiking', 'Music', 'Gaming', 'Cooking', 'Travel',
  'Fitness', 'Reading', 'Art', 'Photography', 'Dancing', 'Movies',
  'Yoga', 'Cycling', 'Nature', 'Fashion', 'Food', 'Cats', 'Dogs',
];

export default function ProfileScreen() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    age: '',
    bio: '',
    avatar_url: null,
    gender: '',
    pref_min_age: '20',
    pref_max_age: '40',
    pref_gender: 'Everyone',
    interests: [],
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState<'me' | 'looking'>('me');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('name, age, bio, avatar_url, gender, pref_min_age, pref_max_age, pref_gender, interests')
      .eq('id', user.id)
      .single();
    if (data) {
      setProfile({
        name: data.name ?? '',
        age: data.age?.toString() ?? '',
        bio: data.bio ?? '',
        avatar_url: data.avatar_url,
        gender: data.gender ?? '',
        pref_min_age: data.pref_min_age?.toString() ?? '20',
        pref_max_age: data.pref_max_age?.toString() ?? '40',
        pref_gender: data.pref_gender ?? 'Everyone',
        interests: data.interests ?? [],
      });
    }
  }

  async function handleSave() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: profile.name,
      age: parseInt(profile.age, 10) || null,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      gender: profile.gender || null,
      pref_min_age: parseInt(profile.pref_min_age, 10) || 18,
      pref_max_age: parseInt(profile.pref_max_age, 10) || 99,
      pref_gender: profile.pref_gender,
      interests: profile.interests,
    });
    setLoading(false);
    if (error) {
      Alert.alert(t('errorSaving'), error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permissionNeeded'), t('allowPhotos'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      const path = `${user.id}/avatar.${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` });

      if (uploadError) {
        Alert.alert('Upload failed', uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      setProfile((p) => ({ ...p, avatar_url: publicUrl }));
    } finally {
      setLoading(false);
    }
  }

  function toggleInterest(interest: string) {
    setProfile((p) => ({
      ...p,
      interests: p.interests.includes(interest)
        ? p.interests.filter((i) => i !== interest)
        : [...p.interests, interest],
    }));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('myProfile')}</Text>
      </View>

      {/* Section tabs */}
      <View style={styles.sectionTabs}>
        <TouchableOpacity
          style={[styles.sectionTab, section === 'me' && styles.sectionTabActive]}
          onPress={() => setSection('me')}
        >
          <Text style={[styles.sectionTabText, section === 'me' && styles.sectionTabTextActive]}>
            {t('aboutMe')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionTab, section === 'looking' && styles.sectionTabActive]}
          onPress={() => setSection('looking')}
        >
          <Text style={[styles.sectionTabText, section === 'looking' && styles.sectionTabTextActive]}>
            {t('lookingFor')}
          </Text>
        </TouchableOpacity>
      </View>

      {section === 'me' ? (
        <>
          {/* Avatar */}
          <TouchableOpacity style={styles.avatarWrap} onPress={handlePickImage}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>{t('addPhoto')}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✎</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={styles.label}>{t('nameLabel')}</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(v) => setProfile((p) => ({ ...p, name: v }))}
              placeholder={t('yourName')}
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>{t('ageLabel')}</Text>
            <TextInput
              style={styles.input}
              value={profile.age}
              onChangeText={(v) => setProfile((p) => ({ ...p, age: v }))}
              placeholder={t('yourAge')}
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              maxLength={2}
            />

            <Text style={styles.label}>{t('iAm')}</Text>
            <View style={styles.genderOptions}>
              {MY_GENDER_KEYS.map((key, i) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.genderBtn, profile.gender === MY_GENDER_VALUES[i] && styles.genderBtnActive]}
                  onPress={() => setProfile((p) => ({ ...p, gender: MY_GENDER_VALUES[i] }))}
                >
                  <Text style={[styles.genderBtnText, profile.gender === MY_GENDER_VALUES[i] && styles.genderBtnTextActive]}>
                    {t(key)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('aboutMeLabel')}</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={profile.bio}
              onChangeText={(v) => setProfile((p) => ({ ...p, bio: v }))}
              placeholder={t('aboutMeLabel')}
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>{t('myInterests')}</Text>
            <View style={styles.tags}>
              {INTEREST_OPTIONS.map((interest) => {
                const selected = profile.interests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    style={[styles.tag, selected && styles.tagSelected]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.form}>
          <Text style={styles.sectionHint}>{t('lookingForHint')}</Text>

          <Text style={styles.label}>{t('interestedIn')}</Text>
          <View style={styles.genderOptions}>
            {PREF_GENDER_KEYS.map((key, i) => (
              <TouchableOpacity
                key={key}
                style={[styles.genderBtn, profile.pref_gender === PREF_GENDER_VALUES[i] && styles.genderBtnActive]}
                onPress={() => setProfile((p) => ({ ...p, pref_gender: PREF_GENDER_VALUES[i] }))}
              >
                <Text style={[styles.genderBtnText, profile.pref_gender === PREF_GENDER_VALUES[i] && styles.genderBtnTextActive]}>
                  {t(key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('partnerAgeRange')}</Text>
          <View style={styles.ageRow}>
            <View style={styles.ageInputWrap}>
              <Text style={styles.ageInputLabel}>{t('min')}</Text>
              <TextInput
                style={styles.ageInput}
                value={profile.pref_min_age}
                onChangeText={(v) => setProfile((p) => ({ ...p, pref_min_age: v }))}
                keyboardType="numeric"
                maxLength={2}
                placeholder="18"
                placeholderTextColor="#aaa"
              />
            </View>
            <Text style={styles.ageDash}>—</Text>
            <View style={styles.ageInputWrap}>
              <Text style={styles.ageInputLabel}>{t('max')}</Text>
              <TextInput
                style={styles.ageInput}
                value={profile.pref_max_age}
                onChangeText={(v) => setProfile((p) => ({ ...p, pref_max_age: v }))}
                keyboardType="numeric"
                maxLength={2}
                placeholder="60"
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          <Text style={styles.ageRangeDisplay}>
            {t('lookingForSomeone', { min: profile.pref_min_age || '18', max: profile.pref_max_age || '60' })}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {saved ? t('saved') : loading ? t('saving') : t('saveProfile')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>{t('signOut')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 60,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  sectionTabActive: {
    backgroundColor: '#e91e8c',
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  sectionTabTextActive: {
    color: '#fff',
  },
  sectionHint: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 8,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e91e8c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editBadgeText: {
    color: '#fff',
    fontSize: 14,
  },
  form: {
    padding: 20,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  bioInput: {
    height: 90,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tagSelected: {
    backgroundColor: '#e91e8c',
    borderColor: '#e91e8c',
  },
  tagText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  genderBtnActive: {
    backgroundColor: '#e91e8c',
    borderColor: '#e91e8c',
  },
  genderBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  genderBtnTextActive: {
    color: '#fff',
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  ageInputWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  ageInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
  },
  ageInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    textAlign: 'center',
    width: '100%',
  },
  ageDash: {
    fontSize: 24,
    color: '#ccc',
    marginTop: 18,
  },
  ageRangeDisplay: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    padding: 20,
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#e91e8c',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  logoutButtonText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
});
