export const API_URL = `https://api.chess.com/pub/player/`

// Every per-player request. chess.com also answers 404 when it fails
// internally (it does for some accounts' /stats), so a missing player is
// told apart by the message: 'User "x" not found.' The pages show "Player
// not found" for that one. A 429 is chess.com's rate limit.
async function chessComFetch(path: string, what: string) {
  const response = await fetch(`${API_URL}${path}`)

  if (response.status === 404) {
    const body = await response.json().catch(() => null)
    if (/not found/i.test(body?.message ?? ''))
      throw new Error('Player not found on Chess.com!')
    throw new Error(`Chess.com couldn't return this player's ${what}.`)
  }
  if (response.status === 429)
    throw new Error('Chess.com rate limit reached, try again in a minute.')
  if (!response.ok) throw new Error(`Failed to fetch the ${what}!`)

  return response.json()
}

export function apiStats(username: string) {
  return chessComFetch(`${username}/stats`, 'stats')
}

export function apiProfile(username: string) {
  return chessComFetch(username, 'profile')
}

export async function apiGames(username: string, year: string, month: string) {
  const response = await fetch(`${API_URL}${username}/games/${year}/${month}`)

  // chess.com lists the current month in a player's archives but can 404
  // on it until the month's games are published: treat that as no games
  // rather than an error.
  if (response.status === 404) return { games: [] }
  if (!response.ok) throw new Error(`Failed to fetch the Games!`)

  const data = response.json()
  return data
}

export function apiArchive(username: string) {
  return chessComFetch(`${username}/games/archives`, 'game archives')
}

export async function apiRecentGames(
  username: string,
  months: number,
  days: number,
) {
  const archivedata = await apiArchive(username)
  const archives = archivedata.archives
  const recentgameUrl = months === 0 ? archives : archives.slice(-months)

  const gameResponses = await Promise.all(
    recentgameUrl.map(async (apiURL: string) => {
      try {
        const response = await fetch(apiURL)
        const data = await response.json()

        return data.games || []
      } catch (error) {
        console.error('Failed to fetch archive:', apiURL, error)
        return []
      }
    }),
  )

  const allGames = gameResponses.flat()
  if (days === 0) return allGames
  const cutoff = Date.now() / 1000 - days * 24 * 60 * 60

  const pastNdaysGames = allGames.filter((game) => game.end_time >= cutoff)

  return pastNdaysGames
}
