import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SwipeCard } from '../../components/SwipeCard';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/LanguageContext';
import type { Profile } from '../../lib/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SwipeScreen() {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastAction, setLastAction] = useState<'like' | 'nope' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) setCurrentUserId(session.user.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setCurrentUserId(session.user.id);
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Reload profiles every time this tab is focused — picks up preference changes
  useFocusEffect(
    useCallback(() => {
      if (currentUserId) loadProfilesForUser(currentUserId);
    }, [currentUserId])
  );

  async function loadProfilesForUser(userId: string) {
    setLoading(true);
    try {
      const user = { id: userId };

      // Get current user's preferences
      const { data: me } = await supabase
        .from('profiles')
        .select('pref_gender, pref_min_age, pref_max_age')
        .eq('id', user.id)
        .single();

      // Get IDs already swiped
      const { data: swiped } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedIds: string[] = (swiped ?? []).map((s: any) => s.swiped_id);

      // Build gender filter
      const prefGender = me?.pref_gender ?? 'Everyone';
      let genderFilter: string[] = [];
      if (prefGender === 'Women') genderFilter = ['Woman'];
      else if (prefGender === 'Men') genderFilter = ['Man'];

      // Fetch candidates
      let query = supabase
        .from('profiles')
        .select('id, name, age, bio, avatar_url')
        .neq('id', user.id)
        .gte('age', me?.pref_min_age ?? 18)
        .lte('age', me?.pref_max_age ?? 99);

      if (genderFilter.length > 0) {
        query = query.in('gender', genderFilter);
      }

      const { data, error } = await query;
      if (error) { setLoading(false); return; }


      // Filter out already-swiped in JS (simpler than complex SQL)
      const unseen = (data ?? []).filter((p: any) => !swipedIds.includes(p.id));

      const mapped: Profile[] = unseen.map((p: any) => ({
        id: p.id,
        name: p.name ?? 'Unknown',
        age: p.age ?? 0,
        bio: p.bio ?? '',
        images: [p.avatar_url ?? `https://api.dicebear.com/9.x/adventurer/png?seed=${p.id}&size=400`],
      }));

      setProfiles(mapped);
    } catch (e) {
      console.error('loadProfiles error:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleSwipe = useCallback(async (direction: 'left' | 'right', profile: Profile) => {
    setLastAction(direction === 'right' ? 'like' : 'nope');
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id));

    if (!currentUserId) return;

    await supabase.from('swipes').insert({
      swiper_id: currentUserId,
      swiped_id: profile.id,
      direction,
    });

    // Check for mutual match
    if (direction === 'right') {
      const { data: theirSwipe } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', profile.id)
        .eq('swiped_id', currentUserId)
        .eq('direction', 'right')
        .single();

      if (theirSwipe) {
        // It's a match!
        const user1 = currentUserId < profile.id ? currentUserId : profile.id;
        const user2 = currentUserId < profile.id ? profile.id : currentUserId;
        await supabase.from('matches').insert({ user1_id: user1, user2_id: user2 });
        setLastAction(null);
        setTimeout(() => setMatchedProfile(profile), 300);
      }
    }
  }, [currentUserId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#e91e8c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Match popup */}
      <Modal visible={!!matchedProfile} transparent animationType="fade">
        <View style={styles.matchOverlay}>
          <View style={styles.matchCard}>
            <Text style={styles.matchEmoji}>🎉</Text>
            <Text style={styles.matchTitle}>{t('itsAMatch')}</Text>
            <Text style={styles.matchSub}>
              {t('matchSub', { name: matchedProfile?.name ?? '' })}
            </Text>
            <TouchableOpacity style={styles.matchBtn} onPress={() => setMatchedProfile(null)}>
              <Text style={styles.matchBtnText}>{t('keepSwiping')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <Text style={styles.title}>{t('appName')}</Text>
      </View>

      <View style={styles.cardArea}>
        {profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌊</Text>
            <Text style={styles.emptyTitle}>{t('noMoreProfiles')}</Text>
            <Text style={styles.emptyText}>{t('noMoreProfilesText')}</Text>
            <TouchableOpacity style={styles.resetButton} onPress={() => currentUserId && loadProfilesForUser(currentUserId)}>
              <Text style={styles.resetButtonText}>{t('refresh')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {profiles.slice(0, 3).reverse().map((profile, i, arr) => {
              const isTop = i === arr.length - 1;
              if (!isTop) {
                return (
                  <View
                    key={profile.id}
                    style={[
                      styles.backgroundCard,
                      { transform: [{ scale: 0.94 - (arr.length - 1 - i) * 0.03 }], top: (arr.length - 1 - i) * 10 },
                    ]}
                  />
                );
              }
              return (
                <SwipeCard
                  key={profile.id}
                  profile={profile}
                  onSwipeLeft={() => handleSwipe('left', profile)}
                  onSwipeRight={() => handleSwipe('right', profile)}
                />
              );
            })}
          </>
        )}
      </View>

      {profiles.length > 0 && (
        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.actionBtn, styles.nopeBtn]} onPress={() => handleSwipe('left', profiles[0])}>
            <Text style={styles.nopeBtnText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={() => handleSwipe('right', profiles[0])}>
            <Text style={styles.likeBtnText}>❤</Text>
          </TouchableOpacity>
        </View>
      )}

      {lastAction && (
        <Text style={styles.lastAction}>
          {lastAction === 'like' ? '💚 Liked!' : '❌ Passed'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', textAlign: 'center' },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  backgroundCard: {
    position: 'absolute',
    width: 320,
    height: 420,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  emptyState: { alignItems: 'center', paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#777', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  resetButton: { backgroundColor: '#e91e8c', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  resetButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 20,
    paddingBottom: 32,
  },
  actionBtn: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  nopeBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#F44336' },
  likeBtn: { backgroundColor: '#e91e8c' },
  nopeBtnText: { fontSize: 26, color: '#F44336' },
  likeBtnText: { fontSize: 26, color: '#fff' },
  lastAction: {
    textAlign: 'center', marginTop: -12, marginBottom: 8,
    fontSize: 14, color: '#555', fontWeight: '600',
  },
  matchOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  matchCard: {
    backgroundColor: '#fff', borderRadius: 28, padding: 36,
    alignItems: 'center', marginHorizontal: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  matchEmoji: { fontSize: 64, marginBottom: 12 },
  matchTitle: {
    fontSize: 32, fontWeight: '900', color: '#e91e8c', marginBottom: 8,
  },
  matchSub: {
    fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  matchBtn: {
    backgroundColor: '#e91e8c', borderRadius: 16,
    paddingHorizontal: 36, paddingVertical: 14,
  },
  matchBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
