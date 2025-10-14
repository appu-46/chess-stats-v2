import { useQuery } from '@tanstack/react-query'
import { apiGames } from '../services/apiStats'

function useGames(username: string, year: number, month: number) {
  const { data, isPending, error } = useQuery({
    queryKey: ['games', username, month, year],
    queryFn: () => apiGames(username, year, month),
  })

  return { data, isPending, error }
}

export default useGames
