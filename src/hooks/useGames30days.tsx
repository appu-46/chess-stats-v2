import { useQuery } from '@tanstack/react-query'
import { apiGamesLast30Days } from '../services/apiStats'
// import { Chess } from 'chess.js'

function useGames30days(username: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['games', username],
    queryFn: () => apiGamesLast30Days(username),
  })

  return { data, isPending, error }
}

export default useGames30days
