-- Multi-platform schema: chess.com + lichess players side by side.
--
--   * player_id int8 -> text  (lichess ids are lowercase usernames, not numbers)
--   * new platform column ('chess.com' | 'lichess') on chess_profile and
--     favourite_players; existing rows are all chess.com
--   * uniqueness moves from (player_id) to (platform, player_id), and from
--     (user_sub, player_id) to (user_sub, platform, player_id) - the app's
--     upserts use exactly these as their onConflict targets
--   * "user"."chessPlatform" remembers which platform a signed-in user's
--     saved username ("chessUserId") belongs to
--
-- Constraint names in the existing schema aren't known up front, so any
-- primary key / unique / foreign key constraint touching player_id is found
-- through the catalog and dropped, then recreated under known names.
-- RLS policies reference user_sub only, so they are unaffected.
--
-- All of the key work happens inside ONE do-block, which Postgres executes
-- as a single atomic statement: if anything fails, nothing is changed. That
-- holds even in clients that commit each statement separately (the Supabase
-- SQL editor does), which is why there is no begin/commit or temp table here.
--
-- Safe to re-run. Tested against a schema where player_id is chess_profile's
-- primary key (favourites with their own id, an FK and
-- unique(user_sub, player_id)) and one with separate id primary keys and a
-- composite favourites key, with each statement auto-committed.
--
-- Apply BEFORE deploying the app version that ships with it: the new upsert
-- onConflict targets fail against the old constraints.

do $$
declare
  c record;
  had_fav_profile_fk boolean;
begin
  -- 0. Remember whether favourites referenced profiles, so the link can be
  --    recreated on the new composite key after the old one is dropped.
  had_fav_profile_fk := exists (
    select 1 from pg_constraint
    where conrelid = 'public.favourite_players'::regclass
      and confrelid = 'public.chess_profile'::regclass
      and contype = 'f'
  );

  -- 1. Drop every key/foreign key involving player_id on either table.
  --    'f' < 'p' < 'u', so foreign keys go before the keys they rely on.
  for c in
    select con.conname, con.conrelid::regclass as tbl
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
    where con.conrelid in ('public.chess_profile'::regclass,
                           'public.favourite_players'::regclass)
      and att.attname = 'player_id'
      and con.contype in ('f', 'p', 'u')
    group by con.conname, con.conrelid, con.contype
    order by con.contype
  loop
    execute format('alter table %s drop constraint if exists %I', c.tbl, c.conname);
  end loop;

  -- Foreign keys from any other table into chess_profile.player_id would
  -- block the type change too.
  for c in
    select con.conname, con.conrelid::regclass as tbl
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.confrelid and att.attnum = any (con.confkey)
    where con.confrelid = 'public.chess_profile'::regclass
      and att.attname = 'player_id'
      and con.contype = 'f'
  loop
    execute format('alter table %s drop constraint if exists %I', c.tbl, c.conname);
  end loop;

  -- Plain unique indexes on player_id would keep enforcing the old
  -- single-platform uniqueness.
  for c in
    select distinct idx.indexrelid::regclass as index_name
    from pg_index idx
    join pg_attribute att
      on att.attrelid = idx.indrelid and att.attnum = any (idx.indkey)
    where idx.indrelid in ('public.chess_profile'::regclass,
                           'public.favourite_players'::regclass)
      and idx.indisunique
      and not idx.indisprimary
      and att.attname = 'player_id'
  loop
    execute format('drop index if exists %s', c.index_name);
  end loop;

  -- 2. player_id -> text, add platform.
  alter table public.chess_profile
    alter column player_id type text using player_id::text,
    add column if not exists platform text not null default 'chess.com';

  alter table public.favourite_players
    alter column player_id type text using player_id::text,
    add column if not exists platform text not null default 'chess.com';

  alter table public.chess_profile
    drop constraint if exists chess_profile_platform_check;
  alter table public.chess_profile
    add constraint chess_profile_platform_check
    check (platform in ('chess.com', 'lichess'));

  alter table public.favourite_players
    drop constraint if exists favourite_players_platform_check;
  alter table public.favourite_players
    add constraint favourite_players_platform_check
    check (platform in ('chess.com', 'lichess'));

  -- 3. Platform-scoped uniqueness (the app's upsert conflict targets). If
  --    player_id was part of the primary key, the new key takes its place as
  --    the primary key; otherwise (e.g. a separate id column is the PK) it's
  --    added as a unique constraint.
  if exists (select 1 from pg_constraint
             where conrelid = 'public.chess_profile'::regclass
               and contype = 'p') then
    alter table public.chess_profile
      add constraint chess_profile_platform_player_id_key
      unique (platform, player_id);
  else
    alter table public.chess_profile
      add constraint chess_profile_pkey primary key (platform, player_id);
  end if;

  if exists (select 1 from pg_constraint
             where conrelid = 'public.favourite_players'::regclass
               and contype = 'p') then
    alter table public.favourite_players
      add constraint favourite_players_user_platform_player_key
      unique (user_sub, platform, player_id);
  else
    alter table public.favourite_players
      add constraint favourite_players_pkey
      primary key (user_sub, platform, player_id);
  end if;

  -- Restore the favourite -> profile link, now on both key columns.
  if had_fav_profile_fk then
    alter table public.favourite_players
      add constraint favourite_players_profile_fkey
      foreign key (platform, player_id)
      references public.chess_profile (platform, player_id);
  end if;

  -- 4. Remember which platform the signed-in user's own username is on.
  alter table public."user"
    add column if not exists "chessPlatform" text not null default 'chess.com';

  alter table public."user"
    drop constraint if exists user_chess_platform_check;
  alter table public."user"
    add constraint user_chess_platform_check
    check ("chessPlatform" in ('chess.com', 'lichess'));
end $$;
