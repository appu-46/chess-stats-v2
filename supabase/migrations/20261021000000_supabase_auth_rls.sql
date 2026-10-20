-- Row Level Security keyed to the verified Supabase Auth session.
--
-- Before: the app signed in with Google directly and called Supabase with
-- only the anon key, so nothing server-side knew who the caller was - any
-- client could pass any user_sub.
--
-- Now the app signs in through Supabase Auth (Google provider) and every
-- request carries the user's JWT. The app keeps the Google account id as its
-- user key ("user".sub, favourite_players.user_sub), so existing rows need no
-- backfill; current_google_sub() maps auth.uid() to that id through
-- auth.identities, which only the auth server writes. (user_metadata is NOT
-- used: users can edit it themselves with auth.updateUser.)
--
--   * "user", favourite_players: authenticated users read/write their own rows
--   * chess_profile: a cache of public chess.com/lichess profile data that the
--     profile page refreshes for signed-out visitors too - anyone may read,
--     insert and update it, nobody may delete
--
-- Every existing policy on these three tables is dropped and replaced.
--
-- Apply AFTER deploying the app version that uses Supabase Auth: the old app
-- sends no JWT, so its writes are rejected by these policies.
--
-- The policy work is one do-block (one atomic statement), since the Supabase
-- SQL editor commits each statement separately. Safe to re-run.

create or replace function public.current_google_sub()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select provider_id
  from auth.identities
  where user_id = auth.uid()
    and provider = 'google'
  limit 1
$$;

revoke execute on function public.current_google_sub() from public, anon;
grant execute on function public.current_google_sub() to authenticated;

do $$
declare
  p record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('user', 'favourite_players', 'chess_profile')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;

  alter table public."user" enable row level security;
  alter table public.favourite_players enable row level security;
  alter table public.chess_profile enable row level security;

  -- "user": own row only. (select ...) lets Postgres evaluate the lookup once
  -- per query instead of once per row.
  create policy user_select_own on public."user"
    for select to authenticated
    using (sub = (select public.current_google_sub()));
  create policy user_insert_own on public."user"
    for insert to authenticated
    with check (sub = (select public.current_google_sub()));
  create policy user_update_own on public."user"
    for update to authenticated
    using (sub = (select public.current_google_sub()))
    with check (sub = (select public.current_google_sub()));

  -- favourite_players: own favourites only.
  create policy favs_select_own on public.favourite_players
    for select to authenticated
    using (user_sub = (select public.current_google_sub()));
  create policy favs_insert_own on public.favourite_players
    for insert to authenticated
    with check (user_sub = (select public.current_google_sub()));
  create policy favs_update_own on public.favourite_players
    for update to authenticated
    using (user_sub = (select public.current_google_sub()))
    with check (user_sub = (select public.current_google_sub()));
  create policy favs_delete_own on public.favourite_players
    for delete to authenticated
    using (user_sub = (select public.current_google_sub()));

  -- chess_profile: public cache, no deletes.
  create policy chess_profile_select on public.chess_profile
    for select to anon, authenticated
    using (true);
  create policy chess_profile_insert on public.chess_profile
    for insert to anon, authenticated
    with check (true);
  create policy chess_profile_update on public.chess_profile
    for update to anon, authenticated
    using (true)
    with check (true);
end
$$;
