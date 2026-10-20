import { supabase } from './supabase'
import type { PlayerProfile } from '../helpers/normalizePlayer'
import type { Platform } from '../helpers/platform'

// A favourite is identified by (platform, player_id): chess.com and lichess
// ids live in the same string column and could otherwise collide.
export type FavKey = { player_id: string; platform: Platform }

export async function upsertUser(user: {
  sub: string
  firstName: string
  lastName: string
  email: string
  profileURL: string
}) {
  const { data, error } = await supabase
    .from('user')
    .upsert(user, { onConflict: 'sub' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateChessUsername(
  sub: string,
  chessUsername: string,
  platform: Platform,
) {
  const { data, error } = await supabase
    .from('user')
    .update({ chessUserId: chessUsername, chessPlatform: platform })
    .eq('sub', sub)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// services/apiUser.ts — add this
export async function getUser(sub: string) {
  const { data, error } = await supabase
    .from('user')
    .select()
    .eq('sub', sub)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getUserFromChessId(chessUsername: string) {
  const { data, error } = await supabase
    .from('user')
    .select()
    .eq('chessUserId', chessUsername)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getChessProfilesForFavs(favs: Array<FavKey>) {
  if (!favs.length) return []

  const { data, error } = await supabase
    .from('chess_profile')
    .select()
    .in(
      'player_id',
      favs.map((fav) => fav.player_id),
    )

  if (error) throw new Error(error.message)

  // The id filter alone can also match a same-id player on the other
  // platform; keep only the exact (platform, player_id) pairs asked for.
  const wanted = new Set(favs.map((fav) => `${fav.platform}:${fav.player_id}`))
  return data.filter((row) => wanted.has(`${row.platform}:${row.player_id}`))
}

export async function upsertChessUser(profile: PlayerProfile) {
  const { country } = profile
  const ChessUser = {
    player_id: profile.playerId,
    platform: profile.platform,
    username: profile.username,
    name: profile.name,
    url: profile.url,
    title: profile.title,
    avatar: profile.avatar,
    country,
    country_api:
      profile.platform === 'chess.com' && country
        ? `https://api.chess.com/pub/country/${country.code}`
        : null,
    country_flag_url:
      country && country.code !== 'XX'
        ? `https://flagsapi.com/${country.code}/flat/32.png`
        : null,
    profile_createdat: profile.joined
      ? new Date(profile.joined * 1000).toISOString()
      : null,
    lastonline: profile.lastOnline
      ? new Date(profile.lastOnline * 1000).toISOString()
      : null,
  }

  const { data, error } = await supabase
    .from('chess_profile')
    .upsert(ChessUser, { onConflict: 'platform,player_id' })
    .select()

  if (error) throw new Error(error.message)

  return data
}

export async function getFavs(sub: string) {
  const { data: favourite_players, error } = await supabase
    .from('favourite_players')
    .select('*')
    .eq('user_sub', sub)

  if (error) throw new Error(error.message)

  return favourite_players
}

export async function deleteFav({
  player_id,
  platform,
  user_sub,
}: FavKey & { user_sub: string }) {
  const { error } = await supabase
    .from('favourite_players')
    .delete()
    .eq('player_id', player_id)
    .eq('platform', platform)
    .eq('user_sub', user_sub)

  if (error) throw new Error(error.message)
}

export async function upsertFav(FavUser: FavKey & { user_sub: string }) {
  const { data, error } = await supabase
    .from('favourite_players')
    .upsert(FavUser, { onConflict: 'user_sub,platform,player_id' })
    .select()

  if (error) throw new Error(error.message)

  return data
}
