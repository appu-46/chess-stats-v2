// The top 100 players in a time control on either site, in one shape.
//
// chess.com's public API only lists the top 50. Ranks 51-100 come from the
// leaderboard endpoint chess.com's own website uses, which is undocumented
// and sends no CORS headers, so it's reached through a same-origin proxy
// (netlify.toml in production, vite.config.ts in development). If it
// fails, the board is the top 50 and says so.
import { normalizeLichessProfile } from '../helpers/normalizePlayer'
import { countryFromChessComCode, countryFromName } from '../helpers/countries'
import { getTimeControls } from '../helpers/timeControls'
import type { Country, LichessUserResponse } from '../helpers/normalizePlayer'
import type { Platform } from '../helpers/platform'

export interface LeaderboardEntry {
  rank: number
  username: string
  name: string | null
  title: string | null
  rating: number
  country: Country | null
  avatar: string | null
}

export interface Leaderboard {
  entries: Array<LeaderboardEntry>
  // chess.com only: ranks 51-100 couldn't be loaded.
  partial: boolean
}

// Time controls with a leaderboard: chess.com's four, and lichess's
// except correspondence, whose top list is empty.
export function leaderboardControls(platform: Platform) {
  return getTimeControls(platform).filter(
    ({ timeClass }) => timeClass !== 'correspondence',
  )
}

// ── chess.com ───────────────────────────────────────────────────────

const CHESS_COM_CATEGORIES: Partial<
  Record<string, { api: string; site: string }>
> = {
  blitz: { api: 'live_blitz', site: 'live/blitz' },
  rapid: { api: 'live_rapid', site: 'live/rapid' },
  bullet: { api: 'live_bullet', site: 'live/bullet' },
  daily: { api: 'daily', site: 'daily' },
}

export const CHESS_COM_LEADERBOARD_PROXY = '/api/chesscom-leaderboard'

type ChessComLeader = {
  username: string
  name?: string
  title?: string
  score: number
  rank: number
  // e.g. "https://api.chess.com/pub/country/US"
  country?: string
  avatar?: string
}

type ChessComSiteLeader = {
  user: {
    username: string
    chess_title?: string
    country_name?: string
    avatar_url?: string
  }
  score: number
  rank: number
}

async function chessComTop50(
  category: string,
): Promise<Array<LeaderboardEntry>> {
  const response = await fetch('https://api.chess.com/pub/leaderboards')
  if (!response.ok) throw new Error('Failed to fetch the leaderboard!')
  const data: Record<string, Array<ChessComLeader> | undefined> =
    await response.json()

  return (data[category] ?? []).map((leader) => {
    const code = leader.country?.split('/').pop()
    return {
      rank: leader.rank,
      username: leader.username,
      name: leader.name ?? null,
      title: leader.title ?? null,
      rating: leader.score,
      country: code ? countryFromChessComCode(code) : null,
      avatar: leader.avatar ?? null,
    }
  })
}

async function chessComRanks51to100(
  path: string,
): Promise<Array<LeaderboardEntry>> {
  const response = await fetch(`${CHESS_COM_LEADERBOARD_PROXY}/${path}?page=2`)
  if (!response.ok) throw new Error('Failed to fetch ranks 51-100!')
  const data: { leaders?: Array<ChessComSiteLeader> } = await response.json()
  if (!data.leaders?.length) throw new Error('No ranks 51-100')

  return data.leaders.map(({ user, score, rank }) => ({
    rank,
    username: user.username,
    name: null,
    title: user.chess_title ?? null,
    rating: score,
    country: countryFromName(user.country_name),
    avatar: user.avatar_url ?? null,
  }))
}

async function chessComLeaderboard(timeClass: string): Promise<Leaderboard> {
  const category = CHESS_COM_CATEGORIES[timeClass]
  if (!category) return { entries: [], partial: false }

  const [top, rest] = await Promise.allSettled([
    chessComTop50(category.api),
    chessComRanks51to100(category.site),
  ])
  if (top.status === 'rejected') throw top.reason

  if (rest.status === 'rejected') {
    console.error(rest.reason)
    return { entries: top.value, partial: true }
  }
  // The two lists come from different endpoints a moment apart; anyone
  // listed by both (they moved across rank 50) is kept once.
  const seen = new Set(top.value.map((entry) => entry.username.toLowerCase()))
  const extra = rest.value.filter(
    (entry) => !seen.has(entry.username.toLowerCase()),
  )
  return { entries: [...top.value, ...extra], partial: false }
}

// ── lichess ─────────────────────────────────────────────────────────

type LichessTopUser = {
  id: string
  username: string
  title?: string
  perfs: Record<string, { rating: number } | undefined>
}

async function lichessLeaderboard(timeClass: string): Promise<Leaderboard> {
  const response = await fetch(
    `https://lichess.org/api/player/top/100/${timeClass}`,
  )
  if (response.status === 429)
    throw new Error('Lichess rate limit reached, try again in a minute.')
  if (!response.ok) throw new Error('Failed to fetch the leaderboard!')
  const { users }: { users: Array<LichessTopUser> } = await response.json()

  // The top list has no countries; one bulk lookup of their profiles
  // does. A failure there just leaves the flags out.
  const profiles = new Map<string, ReturnType<typeof normalizeLichessProfile>>()
  try {
    const bulk = await fetch('https://lichess.org/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: users.map((user) => user.id).join(','),
    })
    if (bulk.ok) {
      const full: Array<LichessUserResponse> = await bulk.json()
      for (const user of full) {
        profiles.set(user.id, normalizeLichessProfile(user))
      }
    }
  } catch (error) {
    console.error(error)
  }

  return {
    entries: users.map((user, index) => {
      const profile = profiles.get(user.id)
      return {
        rank: index + 1,
        username: user.username,
        name: profile?.name ?? null,
        title: user.title ?? null,
        rating: user.perfs[timeClass]?.rating ?? 0,
        country: profile?.country ?? null,
        avatar: null,
      }
    }),
    partial: false,
  }
}

export function fetchLeaderboard(
  platform: Platform,
  timeClass: string,
): Promise<Leaderboard> {
  return platform === 'lichess'
    ? lichessLeaderboard(timeClass)
    : chessComLeaderboard(timeClass)
}
