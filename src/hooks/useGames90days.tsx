import { useQuery } from '@tanstack/react-query'
import { apiGamesLast90Days } from '../services/apiStats'
// import { Chess } from 'chess.js'

function useGames90days(username: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['games', username],
    queryFn: () => apiGamesLast90Days(username),
  })

  return { data, isPending, error }
}

export default useGames90days
