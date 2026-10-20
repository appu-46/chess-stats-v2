import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchRecentGames } from '../services/apiPlayer'
import { DEFAULT_PLATFORM } from '../helpers/platform'
import type { Platform } from '../helpers/platform'

function useGamesRecentdays(
  username: string,
  range: string = '90D',
  platform: Platform = DEFAULT_PLATFORM,
) {
  const queryClient = useQueryClient()

  const has1Y = queryClient.getQueryData(['games', platform, username, '1Y'])
  const hasAll = queryClient.getQueryData(['games', platform, username, 'All'])

  const cacheKey = hasAll
    ? 'All'
    : has1Y && (range === '7D' || range === '30D' || range === '90D')
      ? '1Y'
      : range === '7D' || range === '30D' || range === '90D'
        ? '90D'
        : range

  const { data, isPending, error } = useQuery({
    queryKey: ['games', platform, username, cacheKey],
    // Branch on the cache key, not the requested range: a background refetch
    // of the shared 'All' entry while viewing 30D must still fetch everything.
    queryFn: () => {
      if (cacheKey === 'All') {
        return fetchRecentGames(platform, username, 0, 0)
      }
      if (cacheKey === '1Y') {
        return fetchRecentGames(platform, username, 12, 365)
      }
      return fetchRecentGames(platform, username, 4, 90)
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return { data, isPending, error }
}

export default useGamesRecentdays
