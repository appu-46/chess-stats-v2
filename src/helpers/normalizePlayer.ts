import type { Platform } from './platform'

// ── Normalized shapes ───────────────────────────────────────────────
// Pages render these; only the adapters below know what each platform's
// API actually returns.

export interface Country {
  // ISO 3166-1 alpha-2, or 'XX' for "International"/no real country.
  code: string
  name: string
}

export interface PlayerProfile {
  platform: Platform
  // String on both platforms: chess.com's numeric ids are stringified,
  // lichess ids are lowercase usernames.
  playerId: string
  username: string
  name: string | null
  url: string
  avatar: string | null
  title: string | null
  followers: number | null
  // Unix seconds.
  joined: number | null
  lastOnline: number | null
  country: Country | null
  // chess.com-only
  league: string | null
  status: string | null
  // lichess-only
  totalGames: number | null
  playTimeSeconds: number | null
  streamUrl: string | null
}

export interface TimeControlStat {
  current: number | null
  best: { rating: number; gameUrl: string | null } | null
  record: { win: number; loss: number; draw: number }
}

// Keyed by time class ('blitz', 'rapid', ...) - see helpers/timeControls.
export type PlayerStats = Partial<Record<string, TimeControlStat>>

// ── chess.com ───────────────────────────────────────────────────────

export interface ChessComProfileResponse {
  player_id: number
  username: string
  name?: string
  url: string
  avatar?: string
  title?: string
  followers?: number
  joined?: number
  last_online?: number
  country?: string
  league?: string
  status?: string
  is_streamer?: boolean
  twitch_url?: string
}

type ChessComStatBlock = {
  last?: { rating: number }
  best?: { rating: number; game?: string }
  record?: { win?: number; loss?: number; draw?: number }
}

export function normalizeChessComProfile(
  raw: ChessComProfileResponse,
  country: Country | null,
): PlayerProfile {
  return {
    platform: 'chess.com',
    playerId: String(raw.player_id),
    username: raw.username,
    name: raw.name ?? null,
    url: raw.url,
    avatar: raw.avatar ?? null,
    title: raw.title ?? null,
    followers: raw.followers ?? null,
    joined: raw.joined ?? null,
    lastOnline: raw.last_online ?? null,
    country,
    league: raw.league ?? null,
    status: raw.status ?? null,
    totalGames: null,
    playTimeSeconds: null,
    streamUrl: raw.is_streamer && raw.twitch_url ? raw.twitch_url : null,
  }
}

// Platforms can report a "best" below the current rating (lichess's
// `highest` lags behind). The best is never lower than the current rating;
// when the current one is higher, there's no single peak game to link to.
function atLeastCurrent(
  best: TimeControlStat['best'],
  current: number | null,
): TimeControlStat['best'] {
  if (!best || current == null || current <= best.rating) return best
  return { rating: current, gameUrl: null }
}

export function normalizeChessComStats(
  raw: Record<string, unknown>,
): PlayerStats {
  const stats: PlayerStats = {}
  for (const [key, value] of Object.entries(raw)) {
    // chess.com prefixes standard-chess blocks with "chess_" (chess_blitz,
    // chess_daily...); chess960_daily, tactics, puzzle_rush etc. are skipped.
    if (!key.startsWith('chess_')) continue
    const block = value as ChessComStatBlock
    stats[key.slice('chess_'.length)] = {
      current: block.last?.rating ?? null,
      best: atLeastCurrent(
        block.best
          ? { rating: block.best.rating, gameUrl: block.best.game ?? null }
          : null,
        block.last?.rating ?? null,
      ),
      record: {
        win: block.record?.win ?? 0,
        loss: block.record?.loss ?? 0,
        draw: block.record?.draw ?? 0,
      },
    }
  }
  return stats
}

// ── lichess ─────────────────────────────────────────────────────────

export interface LichessUserResponse {
  id: string
  username: string
  title?: string
  url: string
  createdAt?: number
  seenAt?: number
  disabled?: boolean
  perfs?: Record<string, { games: number; rating: number }>
  profile?: {
    flag?: string
    country?: string
    realName?: string
    firstName?: string
    lastName?: string
  }
  count?: { all?: number }
  playTime?: { total?: number }
  streamer?: { twitch?: { channel?: string }; youTube?: { channel?: string } }
}

export interface LichessPerfResponse {
  perf?: { glicko?: { rating?: number } }
  stat?: {
    highest?: { int: number; gameId: string }
    count?: { win?: number; loss?: number; draw?: number }
  }
}

// Lichess flags that aren't plain ISO countries. Subdivisions map to their
// parent country's flag; the "_"-prefixed ones are lichess-specific.
const LICHESS_SUBDIVISIONS: Partial<Record<string, Country>> = {
  'GB-ENG': { code: 'GB', name: 'England' },
  'GB-SCT': { code: 'GB', name: 'Scotland' },
  'GB-WLS': { code: 'GB', name: 'Wales' },
  'GB-NIR': { code: 'GB', name: 'Northern Ireland' },
  'ES-CT': { code: 'ES', name: 'Catalonia' },
  'ES-EU': { code: 'ES', name: 'Basque Country' },
  'ES-GA': { code: 'ES', name: 'Galicia' },
}

let regionNames: Intl.DisplayNames | null | undefined

function regionName(code: string): string {
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
    } catch {
      regionNames = null
    }
  }
  try {
    return regionNames?.of(code) ?? code
  } catch {
    return code
  }
}

export function lichessFlagToCountry(flag: string | undefined): Country | null {
  if (!flag) return null
  const subdivision = LICHESS_SUBDIVISIONS[flag]
  if (subdivision) return subdivision
  if (/^[A-Z]{2}$/.test(flag)) return { code: flag, name: regionName(flag) }
  return { code: 'XX', name: 'International' }
}

export function normalizeLichessProfile(
  raw: LichessUserResponse,
): PlayerProfile {
  const p = raw.profile ?? {}
  const fullName =
    p.realName || [p.firstName, p.lastName].filter(Boolean).join(' ') || null

  return {
    platform: 'lichess',
    playerId: raw.id,
    username: raw.username,
    name: fullName,
    url: raw.url,
    avatar: null,
    title: raw.title ?? null,
    // Lichess no longer exposes follower counts publicly.
    followers: null,
    joined: raw.createdAt ? Math.floor(raw.createdAt / 1000) : null,
    lastOnline: raw.seenAt ? Math.floor(raw.seenAt / 1000) : null,
    country: lichessFlagToCountry(p.flag ?? p.country),
    league: null,
    status: null,
    totalGames: raw.count?.all ?? null,
    playTimeSeconds: raw.playTime?.total ?? null,
    streamUrl:
      raw.streamer?.twitch?.channel ?? raw.streamer?.youTube?.channel ?? null,
  }
}

export function normalizeLichessPerf(
  raw: LichessPerfResponse,
): TimeControlStat {
  const rating = raw.perf?.glicko?.rating
  const highest = raw.stat?.highest
  const current = rating != null ? Math.round(rating) : null
  return {
    current,
    best: atLeastCurrent(
      highest
        ? {
            rating: highest.int,
            gameUrl: `https://lichess.org/${highest.gameId}`,
          }
        : null,
      current,
    ),
    record: {
      win: raw.stat?.count?.win ?? 0,
      loss: raw.stat?.count?.loss ?? 0,
      draw: raw.stat?.count?.draw ?? 0,
    },
  }
}
