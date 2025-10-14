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

export async function apiGames(username: string, year: number, month: number) {
  const response = await fetch(`${API_URL}${username}/games/${year}/${month}`)

  if (!response.ok) throw new Error(`Failed to fetch the Games!`)

  const data = response.json()
  return data
}
