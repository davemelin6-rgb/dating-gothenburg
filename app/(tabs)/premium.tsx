import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/LanguageContext';

const FEATURES = [
  { icon: '❤️', sv: 'Se vem som gillade dig', en: 'See who liked you' },
  { icon: '⚡', sv: 'Obegränsade likes', en: 'Unlimited likes' },
  { icon: '🚀', sv: 'Boost — syns högst upp i 30 min', en: 'Boost — appear at top for 30 min' },
  { icon: '↩️', sv: 'Ångra senaste svep', en: 'Undo last swipe' },
];

export default function PremiumScreen() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('is_premium, premium_until').eq('id', user.id).single();
      if (data) {
        setIsPremium(data.is_premium ?? false);
        setPremiumUntil(data.premium_until);
      }
    });
  }, []);

  async function handleUpgrade() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  }

  const title = lang === 'sv' ? 'Dating Göteborg Premium' : 'Dating Gothenburg Premium';
  const subtitle = lang === 'sv' ? 'Hitta din match snabbare' : 'Find your match faster';
  const price = lang === 'sv' ? '149 kr/månad' : '149 SEK/month';
  const btnText = lang === 'sv' ? 'Uppgradera nu' : 'Upgrade now';
  const activeText = lang === 'sv' ? 'Du är Premium!' : 'You are Premium!';
  const untilText = lang === 'sv' ? 'Aktivt till' : 'Active until';
  const cancelText = lang === 'sv' ? 'Avbryt när som helst · Säker betalning via Stripe' : 'Cancel anytime · Secure payment via Stripe';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.featureList}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{lang === 'sv' ? f.sv : f.en}</Text>
          </View>
        ))}
      </View>

      {isPremium ? (
        <View style={styles.activeBox}>
          <Text style={styles.activeTitle}>{activeText}</Text>
          {premiumUntil && (
            <Text style={styles.activeUntil}>
              {untilText} {new Date(premiumUntil).toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-GB')}
            </Text>
          )}
        </View>
      ) : (
        <>
          <View style={styles.priceBox}>
            <Text style={styles.price}>{price}</Text>
          </View>
          <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.upgradeBtnText}>{btnText}</Text>}
          </TouchableOpacity>
          <Text style={styles.cancel}>{cancelText}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { paddingBottom: 60, alignItems: 'center' },
  hero: { alignItems: 'center', paddingTop: 70, paddingBottom: 32, paddingHorizontal: 24 },
  crown: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  featureList: { width: '100%', paddingHorizontal: 24, gap: 16, marginBottom: 36 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 16 },
  featureIcon: { fontSize: 26 },
  featureText: { fontSize: 16, color: '#fff', fontWeight: '500', flex: 1 },
  priceBox: { marginBottom: 16 },
  price: { fontSize: 32, fontWeight: '900', color: '#e91e8c', textAlign: 'center' },
  upgradeBtn: { backgroundColor: '#e91e8c', borderRadius: 18, paddingVertical: 18, paddingHorizontal: 60, marginBottom: 16 },
  upgradeBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  cancel: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  activeBox: { backgroundColor: 'rgba(233,30,140,0.15)', borderRadius: 18, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#e91e8c', marginHorizontal: 24 },
  activeTitle: { fontSize: 24, fontWeight: '900', color: '#e91e8c', marginBottom: 8 },
  activeUntil: { fontSize: 15, color: 'rgba(255,255,255,0.6)' },
});
