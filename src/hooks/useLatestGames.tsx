import { useQuery } from '@tanstack/react-query'
import { fetchLatestGames } from '../services/apiPlayer'
import { DEFAULT_PLATFORM } from '../helpers/platform'
import type { Platform } from '../helpers/platform'

function useLatestGames(
  username: string,
  count: number,
  platform: Platform = DEFAULT_PLATFORM,
) {
  const { data, isPending, error } = useQuery({
    queryKey: ['latestGames', platform, username, count],
    queryFn: () => fetchLatestGames(platform, username, count),
    staleTime: 2 * 60 * 1000,
  })

  return { games: data, isPending, error }
}

export default useLatestGames
