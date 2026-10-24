import { useQuery } from '@tanstack/react-query'
import { fetchCurrentRatings, fetchLatestGames } from '../services/apiPlayer'
import { limitConcurrency } from '../helpers/limitConcurrency'
import type { Platform } from '../helpers/platform'

// A page of favourites asks for every player's ratings and games together.
// Lichess wants one request at a time, and chess.com rate-limits parallel
// ones, so the cards wait their turn rather than all firing at once.
const limiters: Record<Platform, ReturnType<typeof limitConcurrency>> = {
  lichess: limitConcurrency(1),
  'chess.com': limitConcurrency(2),
}

// Current ratings plus the newest games, for a player summary card. The
// games share their cache entry with the profile's recent games.
function usePlayerSnapshot(
  username: string,
  platform: Platform,
  gameCount: number,
  enabled: boolean,
) {
  const limit = limiters[platform]

  const ratings = useQuery({
    queryKey: ['ratings', platform, username.toLowerCase()],
    queryFn: () => limit(() => fetchCurrentRatings(platform, username)),
    enabled,
    staleTime: 5 * 60 * 1000,
  })

  const games = useQuery({
    queryKey: ['latestGames', platform, username, gameCount],
    queryFn: () => limit(() => fetchLatestGames(platform, username, gameCount)),
    enabled,
    staleTime: 2 * 60 * 1000,
  })

  return { ratings, games }
}

export default usePlayerSnapshot
