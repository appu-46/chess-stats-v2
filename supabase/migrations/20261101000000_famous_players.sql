-- famous_players: a hand-picked list of well-known accounts to suggest to
-- people who don't know who to look up yet. Titled or not: Samay Raina has
-- no title and plays unrated, but plenty of visitors will search for him.
--
-- The app only reads it (the homepage and Compare "Try:" chips, and the
-- switch player list). Rows are added, reordered and removed by hand in the
-- Supabase dashboard or SQL editor; nobody can write through the API.
--
--   name     what the chips and lists show, e.g. "Samay Raina"
--   tagline  optional, why they're on the list, e.g. "Comedian and streamer"
--   rank     display order, lowest first; the homepage shows the first few
--
-- Every statement is safe to re-run (the SQL editor commits each one
-- separately).

create table if not exists public.famous_players (
  id bigint generated always as identity primary key,
  platform text not null default 'chess.com'
    check (platform in ('chess.com', 'lichess')),
  username text not null check (username ~ '^[A-Za-z0-9_-]{2,30}$'),
  name text not null,
  tagline text,
  rank integer not null default 100,
  created_at timestamptz not null default now()
);

-- One row per account, however its name is capitalised.
create unique index if not exists famous_players_platform_username_key
  on public.famous_players (platform, lower(username));

alter table public.famous_players enable row level security;

drop policy if exists famous_players_select on public.famous_players;
create policy famous_players_select on public.famous_players
  for select to anon, authenticated using (true);

-- No write policies, so RLS already refuses writes; the revoke says it
-- outright as well.
revoke insert, update, delete, truncate on public.famous_players
  from anon, authenticated;

-- Usernames checked against both sites' APIs on 2026-11-01.
insert into public.famous_players (platform, username, name, tagline, rank)
values
  ('chess.com', 'Hikaru', 'Hikaru Nakamura', 'Grandmaster and streamer', 10),
  ('chess.com', 'MagnusCarlsen', 'Magnus Carlsen', 'Five-time world champion', 20),
  ('chess.com', 'samayraina', 'Samay Raina', 'Comedian and chess streamer', 30),
  ('chess.com', 'GothamChess', 'Levy Rozman', 'Chess YouTuber', 40),
  ('chess.com', 'GukeshDommaraju', 'Gukesh D', '18th world champion', 50),
  ('lichess', 'DrNykterstein', 'Magnus Carlsen', 'Magnus on Lichess', 60),
  ('chess.com', 'AlexandraBotez', 'Alexandra Botez', 'Streamer', 70),
  ('chess.com', 'rpragchess', 'Praggnanandhaa R', 'Grandmaster', 80),
  ('chess.com', 'annacramling', 'Anna Cramling', 'Streamer', 90),
  ('chess.com', 'viditchess', 'Vidit Gujrathi', 'Grandmaster and streamer', 100),
  ('chess.com', 'nihalsarin', 'Nihal Sarin', 'Grandmaster and streamer', 110),
  ('chess.com', 'FabianoCaruana', 'Fabiano Caruana', 'Grandmaster', 120),
  ('chess.com', 'AnishGiri', 'Anish Giri', 'Grandmaster', 130),
  ('chess.com', 'ChessBrah', 'Chessbrah', 'Streamers', 140),
  ('lichess', 'EricRosen', 'Eric Rosen', 'Streamer', 150),
  ('lichess', 'penguingm1', 'Andrew Tang', 'Bullet streamer', 160)
on conflict (platform, lower(username)) do nothing;
