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
