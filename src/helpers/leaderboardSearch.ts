// /leaderboard?tc=rapid&country=India&title=GM (plus platform=lichess, as
// on the player pages). The country is its display name, and "none" picks
// the players who haven't set one.
export type LeaderboardSearch = {
  platform?: 'lichess'
  tc?: string
  country?: string
  title?: string
}

export const NO_COUNTRY = 'none'

function text(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return String(value)
}

export function validateLeaderboardSearch(
  search: Record<string, unknown>,
): LeaderboardSearch {
  const result: LeaderboardSearch = {}
  if (search.platform === 'lichess') result.platform = 'lichess'
  const tc = text(search.tc)
  const country = text(search.country)
  const title = text(search.title)
  if (tc) result.tc = tc
  if (country) result.country = country
  if (title) result.title = title
  return result
}
