import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// PKCE: Google redirects back with ?code=..., which the client exchanges for
// a session on load and then strips from the URL. Every request after that
// carries the user's JWT, which is what the RLS policies check.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { flowType: 'pkce' },
})
