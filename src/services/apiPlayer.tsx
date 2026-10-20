// Platform dispatch layer: hooks call these with a platform and get the same
// normalized shapes back regardless of where the data came from.
import dayjs from 'dayjs'
import {
  normalizeChessComProfile,
  normalizeChessComStats,
  normalizeLichessPerf,
  normalizeLichessProfile,
} from '../helpers/normalizePlayer'
import { getTimeControls } from '../helpers/timeControls'
import { apiFlags } from './apiFlags'
import { apiGames, apiProfile, apiRecentGames, apiStats } from './apiStats'
import { apiFetchLiGames, apiFetchLiPerf, apiFetchLiUser } from './apiLichess'
import type {
  Country,
  PlayerProfile,
  PlayerStats,
} from '../helpers/normalizePlayer'
import type { ChessComGame, LichessGame } from '../helpers/transformGame'
import type { Platform } from '../helpers/platform'

export type RawGame = ChessComGame | LichessGame

export async function fetchPlayerProfile(
  platform: Platform,
  username: string,
): Promise<PlayerProfile> {
  if (platform === 'lichess') {
    return normalizeLichessProfile(await apiFetchLiUser(username))
  }

  const raw = await apiProfile(username)
  let country: Country | null = null
  if (raw.country) {
    try {
      country = await apiFlags(raw.country)
    } catch (error) {
      // A missing flag shouldn't take the whole profile down with it.
      console.error(error)
    }
  }
  return normalizeChessComProfile(raw, country)
}

export async function fetchPlayerStats(
  platform: Platform,
  username: string,
): Promise<PlayerStats> {
  if (platform === 'chess.com') {
    return normalizeChessComStats(await apiStats(username))
  }

  // Lichess has no single "all perfs with W/L/D" endpoint, so this fetches
  // one perf at a time - sequentially, per lichess's one-request-at-a-time
  // API guideline - and only for speeds the player has actually played.
  const user = await apiFetchLiUser(username)
  const stats: PlayerStats = {}
  for (const { timeClass } of getTimeControls('lichess')) {
    if (!user.perfs?.[timeClass]?.games) continue
    stats[timeClass] = normalizeLichessPerf(
      await apiFetchLiPerf(username, timeClass),
    )
  }
  return stats
}

// `months`/`days` of 0 mean "no limit", mirroring apiRecentGames.
export async function fetchRecentGames(
  platform: Platform,
  username: string,
  months: number,
  days: number,
): Promise<Array<RawGame>> {
  if (platform === 'chess.com') return apiRecentGames(username, months, days)

  const since = days > 0 ? Date.now() - days * 24 * 60 * 60 * 1000 : undefined
  return apiFetchLiGames(username, { since })
}

// `month` is 1-indexed ("01".."12"), as in the dashboard's search params.
export async function fetchMonthGames(
  platform: Platform,
  username: string,
  year: string,
  month: string,
): Promise<Array<RawGame>> {
  if (platform === 'chess.com') {
    const data = await apiGames(username, year, month)
    return data?.games ?? []
  }

  const start = dayjs(`${year}-${month}-01`).startOf('month')
  return apiFetchLiGames(username, {
    since: start.valueOf(),
    until: start.endOf('month').valueOf(),
  })
}
