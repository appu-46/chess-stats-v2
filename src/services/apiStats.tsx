export const API_URL = `https://api.chess.com/pub/player/`

export async function apiStats(username: string) {
  const response = await fetch(`${API_URL}${username}/stats`)

  if (!response.ok) throw new Error(`Failed to fetch the Stats!`)

  const data = response.json()
  return data
}

export async function apiProfile(username: string) {
  const response = await fetch(`${API_URL}${username}`)

  if (!response.ok) throw new Error(`Failed to fetch the Profile!`)

  const data = await response.json()
  return data
}

export async function apiGames(username: string, year: string, month: string) {
  const response = await fetch(`${API_URL}${username}/games/${year}/${month}`)

  if (!response.ok) throw new Error(`Failed to fetch the Games!`)

  const data = response.json()
  return data
}

export async function apiArchive(username: string) {
  const response = await fetch(`${API_URL}${username}/games/archives`)

  if (!response.ok) {
    throw (new Error(`Failed to fetch the Archives`), console.error(response))
  }

  const data = response.json()

  return data
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
