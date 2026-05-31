import { supabase } from './supabase'

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

export async function updateChessUsername(sub: string, chessUsername: string) {
  const { data, error } = await supabase
    .from('user')
    .update({ chessUserId: chessUsername })
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

export async function getUserFromPlayerID(playerID: Array<string>) {
  const { data, error } = await supabase
    .from('chess_profile')
    .select()
    .in('player_id', playerID)

  if (error) throw new Error(error.message)
  return data
}

export async function upsertChessUser(ChessUser: {
  player_id: number
  username: string
  name: string
  url: string
  avatar: string
  title: string
  country: { code: string; name: string }
  country_flag_url: string
  country_api: string
  profile_createdat: string
  lastonline: string
}) {
  const { data, error } = await supabase
    .from('chess_profile')
    .upsert(ChessUser, { onConflict: 'player_id' })
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
  user_sub,
}: {
  player_id: number
  user_sub: string
}) {
  const { data, count, error } = await supabase
    .from('favourite_players')
    .delete()
    .eq('player_id', player_id)
    .eq('user_sub', user_sub)

  console.log({ error, data, count })
  if (error) throw new Error(error.message)
}

export async function upsertFav(FavUser: {
  user_sub: string
  player_id: number
}) {
  const { data, error } = await supabase
    .from('favourite_players')
    .upsert(FavUser, { onConflict: 'user_sub,player_id' })
    .select()

  if (error) throw new Error(error.message)

  return data
}
