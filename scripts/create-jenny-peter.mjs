import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ohqxqkfpunhrxlfbkzpa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocXhxa2ZwdW5ocnhsZmJrenBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODI1NzcsImV4cCI6MjA5NzQ1ODU3N30.MSlq_YBgSiO_K-CrcX_qwLVRc4mEA7MSv46nhaS_OXw'
);

async function create(email, password, profile) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: profile.name, age: profile.age } } });
  if (error) { console.error(`${email}: ${error.message}`); return; }
  const user = data.user;
  await supabase.from('profiles').upsert({ id: user.id, ...profile });
  console.log(`✓ ${profile.name} (${email})`);
  return user.id;
}

const jennyId = await create('testjenny@test.com', 'jenny123', {
  name: 'Jenny', age: 28, gender: 'Woman',
  bio: 'Gillar fika, promenader och spontana äventyr i Göteborg.',
  pref_gender: 'Men', pref_min_age: 22, pref_max_age: 40,
  interests: ['Coffee', 'Hiking', 'Music'],
});

const peterId = await create('testpeter@test.com', 'peter123', {
  name: 'Peter', age: 31, gender: 'Man',
  bio: 'Fotbollsfantast och hemmakock. Hittas på Liseberg eller i köket.',
  pref_gender: 'Women', pref_min_age: 22, pref_max_age: 38,
  interests: ['Food', 'Fitness', 'Travel'],
});

// Peter already liked Jenny — swipe right on Peter as Jenny = instant match
if (jennyId && peterId) {
  await supabase.from('swipes').upsert({ swiper_id: peterId, swiped_id: jennyId, direction: 'right' });
  console.log('✓ Peter pre-liked Jenny');
}

console.log('\n✅ Done!');
console.log('  testjenny@test.com  /  jenny123');
console.log('  testpeter@test.com  /  peter123');
