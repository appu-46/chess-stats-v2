import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRecentGames } from '../services/apiStats'
// import { Chess } from 'chess.js'

function useGamesRecentdays(username: string, range: string = '90D') {
  const queryClient = useQueryClient()

  const has1Y = queryClient.getQueryData(['games', username, '1Y'])
  const hasAll = queryClient.getQueryData(['games', username, 'All'])

  const cacheKey = hasAll
    ? 'All'
    : has1Y && (range === '7D' || range === '30D' || range === '90D')
      ? '1Y'
      : range === '7D' || range === '30D' || range === '90D'
        ? '90D'
        : range

  const { data, isPending, error } = useQuery({
    queryKey: ['games', username, cacheKey],
    queryFn: () => {
      if (range === 'All') {
        return apiRecentGames(username, 0, 0)
      }
      if (range === '1Y') {
        return apiRecentGames(username, 12, 365)
      }
      if (range === '7D' || range === '30D' || range === '90D') {
        return apiRecentGames(username, 4, 90)
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return { data, isPending, error }
}

export default useGamesRecentdays
