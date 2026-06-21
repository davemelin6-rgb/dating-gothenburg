-- Dating Gothenburg — database schema
-- Run this in your Supabase SQL editor

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  age integer check (age >= 18 and age <= 99),
  bio text default '',
  avatar_url text,
  -- Partner preferences
  pref_min_age integer default 18,
  pref_max_age integer default 99,
  pref_gender text default 'Everyone' check (pref_gender in ('Women', 'Men', 'Everyone')),
  interests text[] default '{}',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view all profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Swipes (tracks who swiped on who and which direction)
create table if not exists swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid references profiles(id) on delete cascade,
  swiped_id uuid references profiles(id) on delete cascade,
  direction text check (direction in ('left', 'right')),
  created_at timestamptz default now(),
  unique(swiper_id, swiped_id)
);

alter table swipes enable row level security;

create policy "Users can insert own swipes"
  on swipes for insert with check (auth.uid() = swiper_id);

create policy "Users can view own swipes"
  on swipes for select using (auth.uid() = swiper_id or auth.uid() = swiped_id);

-- Matches (created when both users swipe right)
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references profiles(id) on delete cascade,
  user2_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user1_id, user2_id)
);

alter table matches enable row level security;

create policy "Users can view own matches"
  on matches for select using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Users can insert matches"
  on matches for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Match participants can read messages"
  on messages for select using (
    exists (
      select 1 from matches
      where matches.id = messages.match_id
        and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );

create policy "Match participants can send messages"
  on messages for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from matches
      where matches.id = messages.match_id
        and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );

-- Enable realtime for messages
alter publication supabase_realtime add table messages;
