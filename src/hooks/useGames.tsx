import { useQuery } from '@tanstack/react-query'
import { apiGames } from '../services/apiStats'
// import { transformGames } from '../helpers/TransformGames'

function useGames(username: string, year: string, month: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['games', username, month, year],
    queryFn: () => apiGames(username, year, month),
  })

  // const transformedData = transformGames(data, username)

  return { data, isPending, error }
}

export default useGames
