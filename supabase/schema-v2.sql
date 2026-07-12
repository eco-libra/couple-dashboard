-- ============================================================
-- v2 multi-tenant schema: accounts, couples, per-couple data.
-- Run once in the Supabase SQL Editor.
-- ============================================================

-- ---- couples & membership --------------------------------------

create table couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  created_at timestamptz not null default now()
);

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  couple_id uuid references couples(id) on delete set null,
  side text check (side in ('A','B')),
  name text not null default '',
  emoji text not null default '',
  lang text not null default 'en',
  tz text not null default 'Asia/Tokyo',
  city text not null default '',
  created_at timestamptz not null default now(),
  unique (couple_id, side)
);

-- helper: is the signed-in user a member of this couple?
create or replace function is_member(c uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles where user_id = auth.uid() and couple_id = c
  );
$$;

alter table couples enable row level security;
alter table profiles enable row level security;

create policy "members read couple" on couples
  for select using (is_member(id));
create policy "authed create couple" on couples
  for insert with check (auth.uid() is not null);

create policy "read own or partner profile" on profiles
  for select using (
    user_id = auth.uid()
    or (couple_id is not null and is_member(couple_id))
  );
create policy "insert own profile" on profiles
  for insert with check (user_id = auth.uid());
create policy "update own profile" on profiles
  for update using (user_id = auth.uid());

-- ---- pairing RPCs (security definer so invite codes stay private) ----

create or replace function create_couple()
returns json language plpgsql security definer as $$
declare c couples;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into couples default values returning * into c;
  insert into profiles (user_id, couple_id, side)
    values (auth.uid(), c.id, 'A')
    on conflict (user_id) do update set couple_id = c.id, side = 'A';
  return json_build_object('couple_id', c.id, 'invite_code', c.invite_code, 'side', 'A');
end;
$$;

create or replace function join_couple(code text)
returns json language plpgsql security definer as $$
declare c couples; taken text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into c from couples where invite_code = code;
  if c.id is null then return json_build_object('error', 'not_found'); end if;
  select side into taken from profiles where couple_id = c.id and user_id = auth.uid();
  if taken is not null then
    return json_build_object('couple_id', c.id, 'side', taken); -- already a member
  end if;
  if exists (select 1 from profiles where couple_id = c.id and side = 'B') then
    return json_build_object('error', 'full');
  end if;
  insert into profiles (user_id, couple_id, side)
    values (auth.uid(), c.id, 'B')
    on conflict (user_id) do update set couple_id = c.id, side = 'B';
  return json_build_object('couple_id', c.id, 'side', 'B');
end;
$$;

-- ---- per-couple data --------------------------------------------

create table couple_settings (
  couple_id uuid primary key references couples(id) on delete cascade,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table couple_settings enable row level security;
create policy "members rw settings" on couple_settings
  for all using (is_member(couple_id)) with check (is_member(couple_id));

create table quiz_answers (
  couple_id uuid not null references couples(id) on delete cascade,
  day_key text not null,
  side text not null check (side in ('A','B')),
  answers jsonb not null,
  created_at timestamptz not null default now(),
  primary key (couple_id, day_key, side)
);
alter table quiz_answers enable row level security;
create policy "members rw quiz" on quiz_answers
  for all using (is_member(couple_id)) with check (is_member(couple_id));

create table shared_locations (
  couple_id uuid not null references couples(id) on delete cascade,
  side text not null check (side in ('A','B')),
  lat double precision not null,
  lon double precision not null,
  updated_at timestamptz not null default now(),
  primary key (couple_id, side)
);
alter table shared_locations enable row level security;
create policy "members rw locations" on shared_locations
  for all using (is_member(couple_id)) with check (is_member(couple_id));

-- media metadata (files themselves stay on Cloudinary, tagged per couple)
create table media_items (
  id bigint generated always as identity primary key,
  couple_id uuid not null references couples(id) on delete cascade,
  side text not null check (side in ('A','B')),
  kind text not null check (kind in ('memory','moment')),
  day_key text,          -- for moments
  rtype text not null check (rtype in ('image','video')),
  public_id text not null,
  version bigint not null,
  format text not null,
  created_at timestamptz not null default now()
);
create index media_items_couple on media_items (couple_id, kind, created_at desc);
alter table media_items enable row level security;
create policy "members rw media" on media_items
  for all using (is_member(couple_id)) with check (is_member(couple_id));

-- v2 push subscriptions (scoped; replaces the v1 table eventually)
create table push_subs_v2 (
  id bigint generated always as identity primary key,
  couple_id uuid not null references couples(id) on delete cascade,
  side text not null check (side in ('A','B')),
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);
alter table push_subs_v2 enable row level security;
create policy "members rw push" on push_subs_v2
  for all using (is_member(couple_id)) with check (is_member(couple_id));
