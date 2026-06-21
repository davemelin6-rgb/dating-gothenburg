import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ohqxqkfpunhrxlfbkzpa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocXhxa2ZwdW5ocnhsZmJrenBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODI1NzcsImV4cCI6MjA5NzQ1ODU3N30.MSlq_YBgSiO_K-CrcX_qwLVRc4mEA7MSv46nhaS_OXw'
);

async function createUser(email, password, profile) {
  console.log(`Creating ${email}...`);
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) { console.error('  Error:', error.message); return null; }
  const user = data.user;
  const { error: pe } = await supabase.from('profiles').upsert({ id: user.id, ...profile });
  if (pe) console.error('  Profile error:', pe.message);
  else console.log(`  ✓ ${profile.name} created`);
  return user;
}

// Woman123 — interested in men, so she will see male profiles
await createUser('womantest@example.com', 'woman123', {
  name: 'Sofia',
  age: 27,
  bio: 'Test woman account. Loves fika and canal walks in Gothenburg.',
  pref_gender: 'Men',
  pref_min_age: 22,
  pref_max_age: 40,
  interests: ['Coffee', 'Hiking', 'Music'],
});

// Man123 — interested in women, so he will see female profiles
await createUser('mantest@example.com', 'man123', {
  name: 'Erik',
  age: 30,
  bio: 'Test man account. Big fan of Gothenburg FC and good food.',
  pref_gender: 'Women',
  pref_min_age: 22,
  pref_max_age: 38,
  interests: ['Food', 'Music', 'Travel'],
});

console.log('\n✅ Test accounts ready:');
console.log('  👩 woman123@datinggothenburg.com  /  Woman123!');
console.log('     → She sees: Men');
console.log('  👨 man123@datinggothenburg.com    /  Man123!');
console.log('     → He sees: Women');
