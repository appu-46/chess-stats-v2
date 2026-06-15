import { useQuery } from '@tanstack/react-query'
import { apiGames } from '../services/apiStats'

function useGames(username: string, year: string, month: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['games', username, month, year],
    queryFn: () => apiGames(username, year, month),
  })

  const games = data?.games

  return { games, isPending, error }
}

export default useGames
