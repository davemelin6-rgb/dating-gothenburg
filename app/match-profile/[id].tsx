import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/LanguageContext';

type MatchProfile = {
  name: string;
  age: number;
  bio: string;
  gender: string;
  avatar_url: string | null;
  interests: string[];
  matchId: string;
};

export default function MatchProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // match id
  const { lang } = useLanguage();
  const [profile, setProfile] = useState<MatchProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: match } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, user1:profiles!matches_user1_id_fkey(name,age,bio,gender,avatar_url,interests), user2:profiles!matches_user2_id_fkey(name,age,bio,gender,avatar_url,interests)')
        .eq('id', id)
        .single();

      if (match) {
        const isUser1 = match.user1_id === user.id;
        const other = (isUser1 ? match.user2 : match.user1) as any;
        setProfile({ ...other, interests: other.interests ?? [], matchId: match.id });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#e91e8c" size="large" /></View>;
  if (!profile) return <View style={styles.center}><Text>Profil hittades inte</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back button */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      {/* Photo */}
      {profile.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoInitial}>{profile.name[0]}</Text>
        </View>
      )}

      {/* Name & age */}
      <View style={styles.nameRow}>
        <Text style={styles.name}>{profile.name}, {profile.age}</Text>
      </View>

      {/* Bio */}
      {profile.bio ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{lang === 'sv' ? 'Om mig' : 'About'}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>
      ) : null}

      {/* Interests */}
      {profile.interests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{lang === 'sv' ? 'Intressen' : 'Interests'}</Text>
          <View style={styles.tags}>
            {profile.interests.map((i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{i}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Chat button */}
      <TouchableOpacity style={styles.chatBtn} onPress={() => router.replace(`/chat/${profile.matchId}`)}>
        <Text style={styles.chatBtnText}>
          💬 {lang === 'sv' ? `Skicka meddelande till ${profile.name}` : `Message ${profile.name}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back: {
    position: 'absolute', top: 52, left: 16, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  backText: { fontSize: 30, color: '#fff', lineHeight: 34 },
  photo: { width: '100%', height: 420 },
  photoPlaceholder: {
    width: '100%', height: 420, backgroundColor: '#e91e8c',
    alignItems: 'center', justifyContent: 'center',
  },
  photoInitial: { fontSize: 100, color: '#fff', fontWeight: '700' },
  nameRow: { padding: 24, paddingBottom: 8 },
  name: { fontSize: 32, fontWeight: '900', color: '#1a1a2e' },
  section: { paddingHorizontal: 24, paddingVertical: 12 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#aaa',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
  bio: { fontSize: 16, color: '#444', lineHeight: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#e91e8c',
  },
  tagText: { fontSize: 13, color: '#e91e8c', fontWeight: '600' },
  chatBtn: {
    margin: 24, backgroundColor: '#e91e8c',
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
  },
  chatBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
