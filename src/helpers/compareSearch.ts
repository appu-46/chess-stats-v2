import { DEFAULT_PLATFORM } from './platform'
import type { Platform } from './platform'

export type ComparedPlayer = { username: string; platform: Platform }

// /compare?a=hikaru&b=drnykterstein&bp=lichess: each player's username, and
// their platform only when it isn't chess.com (as on the player pages).
// `tc` is the chart's time control, and `range` is set only for 1Y.
export type CompareSearch = {
  a?: string
  ap?: 'lichess'
  b?: string
  bp?: 'lichess'
  tc?: string
  range?: '1Y'
}

// Usernames that look like numbers come back from the URL as numbers.
function text(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return String(value)
}

export function validateCompareSearch(
  search: Record<string, unknown>,
): CompareSearch {
  const result: CompareSearch = {}
  const a = text(search.a)
  const b = text(search.b)
  const tc = text(search.tc)
  if (a) result.a = a
  if (a && search.ap === 'lichess') result.ap = 'lichess'
  if (b) result.b = b
  if (b && search.bp === 'lichess') result.bp = 'lichess'
  if (tc) result.tc = tc
  if (search.range === '1Y') result.range = '1Y'
  return result
}

export function comparedPlayer(
  username: string | undefined,
  platform: 'lichess' | undefined,
): ComparedPlayer | null {
  return username ? { username, platform: platform ?? DEFAULT_PLATFORM } : null
}

// The search params that put `player` in one slot.
export function slotSearch(
  slot: 'a' | 'b',
  player: ComparedPlayer | null,
): CompareSearch {
  const platformKey = slot === 'a' ? 'ap' : 'bp'
  return {
    [slot]: player?.username,
    [platformKey]: player?.platform === 'lichess' ? 'lichess' : undefined,
  }
}

export function samePlayer(a: ComparedPlayer, b: ComparedPlayer) {
  return (
    a.platform === b.platform &&
    a.username.toLowerCase() === b.username.toLowerCase()
  )
}
