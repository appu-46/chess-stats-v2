export async function apiFlags(url: string) {
  const response = await fetch(`${url}`)

  if (!response.ok) throw new Error('Error getting the country url!')

  const data = response.json()

  return data
}
