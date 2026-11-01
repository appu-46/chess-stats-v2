import { parsePlatform } from '../helpers/platform'
import { supabase } from './supabase'
import type { Platform } from '../helpers/platform'

// A hand-picked well-known account (supabase/migrations/..._famous_players.sql),
// titled or not.
export type FamousPlayer = {
  platform: Platform
  username: string
  name: string
  tagline: string | null
}

export async function getFamousPlayers(): Promise<Array<FamousPlayer>> {
  const { data, error } = await supabase
    .from('famous_players')
    .select('platform, username, name, tagline')
    .order('rank')
    .order('username')

  if (error) throw new Error(error.message)
  return data.map((row) => ({ ...row, platform: parsePlatform(row.platform) }))
}
