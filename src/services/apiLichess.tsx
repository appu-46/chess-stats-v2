import type { LichessGame } from '../helpers/transformGame'
import type {
  LichessPerfResponse,
  LichessUserResponse,
} from '../helpers/normalizePlayer'

const LI_API_URL = `https://lichess.org/api`

// Lichess streams game exports at ~20 games/sec for anonymous requests, so
// an uncapped "All" export for an active player can take many minutes.
// Every export is capped to the most recent N games instead.
export const LICHESS_MAX_GAMES = 1000

// Only the standard-chess speeds the app has time-control tabs for.
const LICHESS_PERF_TYPES = 'bullet,blitz,rapid,classical,correspondence'

async function lichessFetch(
  path: string,
  init?: RequestInit,
  notFoundMessage = 'Player not found on Lichess!',
) {
  const response = await fetch(`${LI_API_URL}${path}`, init)

  if (response.status === 404) throw new Error(notFoundMessage)
  if (response.status === 429)
    throw new Error('Lichess rate limit reached, try again in a minute.')
  if (!response.ok) throw new Error(`Failed to fetch lichess data!`)

  return response
}

export async function apiFetchLiUser(
  username: string,
): Promise<LichessUserResponse> {
  const response = await lichessFetch(`/user/${encodeURIComponent(username)}`)
  const data = await response.json()

  if (data.disabled) throw new Error('This Lichess account is closed.')
  return data
}

export async function apiFetchLiPerf(
  username: string,
  perf: string,
): Promise<LichessPerfResponse> {
  const response = await lichessFetch(
    `/user/${encodeURIComponent(username)}/perf/${perf}`,
  )
  return response.json()
}

// Returns finished games oldest-first, matching the chess.com archive order
// the dashboard relies on (it reads the last game of each day as that
// day's rating).
export async function apiFetchLiGames(
  username: string,
  {
    since,
    until,
    max = LICHESS_MAX_GAMES,
  }: { since?: number; until?: number; max?: number } = {},
): Promise<Array<LichessGame>> {
  const params = new URLSearchParams({
    max: String(max),
    perfType: LICHESS_PERF_TYPES,
    opening: 'true',
    moves: 'true',
    finished: 'true',
    // Newest-first so the cap keeps the most recent games, reversed below.
    sort: 'dateDesc',
  })
  if (since) params.set('since', String(since))
  if (until) params.set('until', String(until))

  const response = await lichessFetch(
    `/games/user/${encodeURIComponent(username)}?${params}`,
    { headers: { Accept: 'application/x-ndjson' } },
    // Lichess also answers 404 here for clients it treats as bots (e.g.
    // headless browsers), so don't claim the player doesn't exist.
    `Couldn't load ${username}'s games from Lichess.`,
  )
  const text = await response.text()

  const games: Array<LichessGame> = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    try {
      games.push(JSON.parse(line))
    } catch (error) {
      console.error('Skipping malformed lichess game line', error)
    }
  }
  return games.reverse()
}

export interface LichessAutocompleteUser {
  id: string
  name: string
  title?: string
  online?: boolean
}

export const LICHESS_AUTOCOMPLETE_MIN_LENGTH = 3

export async function apiLichessAutocomplete(
  term: string,
  signal?: AbortSignal,
): Promise<Array<LichessAutocompleteUser>> {
  if (term.length < LICHESS_AUTOCOMPLETE_MIN_LENGTH) return []

  const params = new URLSearchParams({ term, object: 'true' })
  const response = await lichessFetch(`/player/autocomplete?${params}`, {
    signal,
  })
  const data = await response.json()
  return data.result ?? []
}
