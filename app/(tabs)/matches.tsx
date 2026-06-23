import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Linking } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/LanguageContext';

type Match = {
  id: string;
  name: string;
  age: number;
  avatar_url: string | null;
  lastMessage: string | null;
};

export default function MatchesScreen() {
  const { t } = useLanguage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [likedMe, setLikedMe] = useState<{ id: string; name: string; age: number }[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadMatches(session.user.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadMatches(session.user.id);
        loadLikedMe(session.user.id);
      } else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadLikedMe(userId: string) {
    const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
    setIsPremium(profile?.is_premium ?? false);

    const { data } = await supabase
      .from('swipes')
      .select('swiper_id, profiles!swipes_swiper_id_fkey(name, age)')
      .eq('swiped_id', userId)
      .eq('direction', 'right');

    // Exclude already matched
    const { data: mySwipes } = await supabase.from('swipes').select('swiped_id').eq('swiper_id', userId);
    const alreadySwiped = new Set((mySwipes ?? []).map((s: any) => s.swiped_id));

    const pending = (data ?? [])
      .filter((s: any) => !alreadySwiped.has(s.swiper_id))
      .map((s: any) => ({ id: s.swiper_id, name: s.profiles?.name ?? '?', age: s.profiles?.age ?? 0 }));

    setLikedMe(pending);
  }

  async function loadMatches(userId: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        user1_id,
        user2_id,
        user1:profiles!matches_user1_id_fkey(name, age, avatar_url),
        user2:profiles!matches_user2_id_fkey(name, age, avatar_url)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (!error && data) {
      const mapped: Match[] = await Promise.all(data.map(async (m: any) => {
        const isUser1 = m.user1_id === userId;
        const other = isUser1 ? m.user2 : m.user1;

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content')
          .eq('match_id', m.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          id: m.id,
          name: other?.name ?? 'Unknown',
          age: other?.age ?? 0,
          avatar_url: other?.avatar_url,
          lastMessage: lastMsg?.content ?? null,
        };
      }));
      setMatches(mapped);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#e91e8c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('matchesTitle')}</Text>
      </View>

      {/* Who liked you */}
      {likedMe.length > 0 && (
        <View style={styles.likedSection}>
          <Text style={styles.likedTitle}>
            {isPremium
              ? (t('messages') === 'Meddelanden' ? `${likedMe.length} person${likedMe.length > 1 ? 'er' : ''} gillade dig` : `${likedMe.length} person${likedMe.length > 1 ? 's' : ''} liked you`)
              : (t('messages') === 'Meddelanden' ? `${likedMe.length} person${likedMe.length > 1 ? 'er' : ''} gillade dig 👑` : `${likedMe.length} person${likedMe.length > 1 ? 's' : ''} liked you 👑`)}
          </Text>
          <View style={styles.likedRow}>
            {likedMe.slice(0, 5).map((p) => (
              <View key={p.id} style={styles.likedCard}>
                {isPremium ? (
                  <>
                    <View style={styles.likedAvatar}>
                      <Text style={styles.likedInitial}>{p.name[0]}</Text>
                    </View>
                    <Text style={styles.likedName}>{p.name}</Text>
                  </>
                ) : (
                  <>
                    <View style={[styles.likedAvatar, styles.likedBlurred]}>
                      <Text style={styles.likedInitialBlurred}>?</Text>
                    </View>
                    <Text style={styles.likedName}>•••</Text>
                  </>
                )}
              </View>
            ))}
          </View>
          {!isPremium && (
            <TouchableOpacity style={styles.unlockBtn} onPress={() => router.push('/(tabs)/premium')}>
              <Text style={styles.unlockBtnText}>
                {t('messages') === 'Meddelanden' ? '👑 Lås upp med Premium' : '👑 Unlock with Premium'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {matches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>{t('noMatchesYet')}</Text>
          <Text style={styles.emptyText}>{t('noMatchesText')}</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.matchItem}
              onPress={() => router.push(`/match-profile/${item.id}`)}
              activeOpacity={0.75}
            >
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>{item.name[0]}</Text>
                </View>
              )}
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{item.name}, {item.age}</Text>
                <Text style={styles.matchPreview} numberOfLines={1}>
                  {item.lastMessage ?? t('tapToSayHello')}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', textAlign: 'center' },
  list: { padding: 16 },
  separator: { height: 12 },
  matchItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarPlaceholder: { backgroundColor: '#e91e8c', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontSize: 24, fontWeight: '700' },
  matchInfo: { flex: 1, marginLeft: 14 },
  matchName: { fontSize: 17, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
  matchPreview: { fontSize: 14, color: '#888' },
  arrow: { fontSize: 22, color: '#ccc', marginLeft: 8 },
  likedSection: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  likedTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  likedRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  likedCard: { alignItems: 'center', gap: 4 },
  likedAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#e91e8c', alignItems: 'center', justifyContent: 'center' },
  likedInitial: { color: '#fff', fontSize: 22, fontWeight: '700' },
  likedBlurred: { backgroundColor: '#ccc' },
  likedInitialBlurred: { color: '#999', fontSize: 22, fontWeight: '700' },
  likedName: { fontSize: 12, color: '#555', fontWeight: '600' },
  unlockBtn: { backgroundColor: '#1a1a2e', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  unlockBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#777', textAlign: 'center', lineHeight: 22 },
});
