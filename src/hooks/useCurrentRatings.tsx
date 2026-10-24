import { useQuery } from '@tanstack/react-query'
import { fetchCurrentRatings } from '../services/apiPlayer'
import { limitConcurrency } from '../helpers/limitConcurrency'
import type { Platform } from '../helpers/platform'

// A page of favourites asks for every player's ratings together. Lichess
// wants one request at a time, and chess.com rate-limits parallel ones, so
// the cards wait their turn rather than all firing at once.
const limiters: Record<Platform, ReturnType<typeof limitConcurrency>> = {
  lichess: limitConcurrency(1),
  'chess.com': limitConcurrency(2),
}

function useCurrentRatings(
  username: string,
  platform: Platform,
  enabled: boolean,
) {
  const limit = limiters[platform]
  return useQuery({
    queryKey: ['ratings', platform, username.toLowerCase()],
    queryFn: () => limit(() => fetchCurrentRatings(platform, username)),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export default useCurrentRatings
