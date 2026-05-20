import { useQuery } from '@tanstack/react-query'
import { apiRecentGames } from '../services/apiStats'
// import { Chess } from 'chess.js'

function useGamesRecentdays(username: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['games', username],
    queryFn: () => apiRecentGames(username),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return { data, isPending, error }
}

export default useGamesRecentdays
