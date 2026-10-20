import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

// The signed-in user, in the shape Google's userinfo endpoint used to return.
// `sub` is the Google account id: it stays the app's user key ("user".sub,
// favourite_players.user_sub), so rows saved before Supabase Auth still match.
export type GoogleUser = {
  sub: string
  given_name?: string
  family_name?: string
  email?: string
  picture?: string
}

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    // Back to the page sign-in started from.
    options: { redirectTo: window.location.href },
  })
}

export function signOut() {
  return supabase.auth.signOut()
}

export function toGoogleUser(user: User): GoogleUser | null {
  const identity = user.identities?.find((i) => i.provider === 'google')
  const sub = identity?.id
  if (!sub) return null

  const meta = { ...user.user_metadata, ...identity.identity_data }
  const [first, ...rest] = String(meta.full_name ?? meta.name ?? '').split(' ')

  return {
    sub,
    given_name: meta.given_name ?? (first || undefined),
    family_name: meta.family_name ?? (rest.join(' ') || undefined),
    email: user.email ?? meta.email,
    picture: meta.avatar_url ?? meta.picture,
  }
}

export async function getGoogleUser(): Promise<GoogleUser | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(error.message)
  return data.session ? toGoogleUser(data.session.user) : null
}
