const API_URL = `https://api.chess.com/pub/player/`

export async function apiStats(username: string) {
  const response = await fetch(`${API_URL}${username}/stats`)

  if (!response.ok) throw new Error(`Failed to fetch the stats!`)

  const data = response.json()
  return data
}
