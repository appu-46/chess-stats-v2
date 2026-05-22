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

  const data = response.json()
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

export async function apiRecentGames(username: string) {
  const archivedata = await apiArchive(username)
  const archives = archivedata.archives
  const recentgameUrl = archives.slice(-4)

  const gameResponses = await Promise.all(
    recentgameUrl.map(async (apiURL: string) => {
      const response = await fetch(apiURL)
      const data = await response.json()

      return data.games || []
    }),
  )

  const allGames = gameResponses.flat()
  const ninetyDaysAgo = Date.now() / 1000 - 90 * 24 * 60 * 60

  const past90DayGames = allGames.filter(
    (game) => game.end_time >= ninetyDaysAgo,
  )

  return past90DayGames
}

export async function apiYearGames(username: string) {
  const archivedata = await apiArchive(username)
  const archives = archivedata.archives
  const recentgameUrl = archives.slice(-12)

  const gameResponses = await Promise.all(
    recentgameUrl.map(async (apiURL: string) => {
      const response = await fetch(apiURL)
      const data = await response.json()

      return data.games || []
    }),
  )

  const allGames = gameResponses.flat()
  const yearago = Date.now() / 1000 - 365 * 24 * 60 * 60

  const pastyearGames = allGames.filter((game) => game.end_time >= yearago)

  return pastyearGames
}
