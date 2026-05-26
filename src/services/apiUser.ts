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

export async function upsertChessUser(ChessUser: {
  player_id: number
  username: string
  name: string
  url: string
  avatar: string
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
