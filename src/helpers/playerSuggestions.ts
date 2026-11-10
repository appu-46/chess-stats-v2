// Username suggestions for the search bars.
//
// Lichess has an autocomplete endpoint; chess.com has no search at all. So
// chess.com's suggestions are put together here from what the app can
// know: players looked up before on this device, the hand-picked famous
// list, chess.com's public lists of titled players, profiles other
// visitors have opened (the chess_profile table), and whether the exact
// username typed exists.
import type { Platform } from './platform'

export interface PlayerSuggestion {
  username: string
  title?: string | null
  // Real name, shown beside the username when known.
  name?: string | null
  // Lichess only.
  online?: boolean
  // Looked up before on this device.
  recent?: boolean
}

export const MAX_SUGGESTIONS = 10

// Titles in the order their holders are suggested.
export const CHESS_COM_TITLES = [
  'GM',
  'IM',
  'FM',
  'NM',
  'CM',
  'WGM',
  'WIM',
  'WFM',
  'WCM',
  'WNM',
] as const

// Both sites' usernames: letters, digits, _ and -.
export const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/

function startsWith(text: string | null | undefined, term: string) {
  return !!text && text.toLowerCase().startsWith(term)
}

// "mag" finds "Magnus Carlsen" and "car" finds it too.
function nameMatches(name: string | null | undefined, term: string) {
  if (!name) return false
  return name
    .toLowerCase()
    .split(/\s+/)
    .some((word) => word.startsWith(term))
}

// Merges the sources into one list, best first, one row per account. A
// row from a later source fills in a title or name the earlier one lacks.
//
// Order: players looked up before, famous players, the exact account
// typed (so "hik" still leads with Hikaru, not the account named "hik"),
// profiles others have opened, and titled players. Before anything is
// typed, only the players looked up before.
export function mergeSuggestions(
  term: string,
  sources: {
    exact?: PlayerSuggestion | null
    recent?: Array<PlayerSuggestion>
    famous?: Array<PlayerSuggestion>
    cached?: Array<PlayerSuggestion>
    titled?: Array<PlayerSuggestion>
  },
  max = MAX_SUGGESTIONS,
): Array<PlayerSuggestion> {
  const needle = term.trim().toLowerCase()
  const merged = new Map<string, PlayerSuggestion>()

  function add(player: PlayerSuggestion) {
    const key = player.username.toLowerCase()
    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, { ...player })
      return
    }
    existing.title ??= player.title
    existing.name ??= player.name
    existing.recent ||= player.recent
  }

  for (const player of sources.recent ?? []) {
    if (startsWith(player.username, needle) || nameMatches(player.name, needle))
      add({ ...player, recent: true })
  }
  if (!needle) return [...merged.values()].slice(0, max)

  for (const player of sources.famous ?? []) {
    if (startsWith(player.username, needle) || nameMatches(player.name, needle))
      add(player)
  }
  if (sources.exact) add(sources.exact)

  for (const player of sources.cached ?? []) {
    if (startsWith(player.username, needle)) add(player)
  }
  for (const player of sources.titled ?? []) {
    // The titled list is long: stop once the list is full. Rows that only
    // fill in details for an account already listed still get through.
    if (merged.size >= max && !merged.has(player.username.toLowerCase()))
      continue
    if (startsWith(player.username, needle)) add(player)
  }

  return [...merged.values()].slice(0, max)
}

// ── Players looked up before, kept on this device ─────────────────────

const RECENT_KEY = 'recent-players'
const MAX_RECENT = 8

type RecentPlayer = PlayerSuggestion & { platform: Platform }

function readRecent(): Array<RecentPlayer> {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(stored)
      ? stored.filter((row) => typeof row?.username === 'string')
      : []
  } catch {
    // Private mode, or something else wrote the key: no recent players.
    return []
  }
}

// Newest first.
export function getRecentPlayers(platform: Platform): Array<PlayerSuggestion> {
  return readRecent()
    .filter((row) => row.platform === platform)
    .map(({ username, title, name }) => ({ username, title, name }))
}

// Called once a profile has loaded, so only real accounts are remembered,
// spelled the way the site spells them.
export function rememberPlayer(platform: Platform, player: PlayerSuggestion) {
  const key = player.username.toLowerCase()
  const rest = readRecent().filter(
    (row) => !(row.platform === platform && row.username.toLowerCase() === key),
  )
  const mine = rest.filter((row) => row.platform === platform)
  const others = rest.filter((row) => row.platform !== platform)
  const next: Array<RecentPlayer> = [
    {
      platform,
      username: player.username,
      title: player.title ?? null,
      name: player.name ?? null,
    },
    ...mine.slice(0, MAX_RECENT - 1),
    ...others,
  ]
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // Private mode etc.: the player just isn't remembered.
  }
}
