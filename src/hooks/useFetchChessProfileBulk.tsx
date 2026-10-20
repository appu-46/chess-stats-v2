import { useQuery } from '@tanstack/react-query'
import { getChessProfilesForFavs } from '../services/apiUser'
import type { FavKey } from '../services/apiUser'

function useFetchChessProfileBulk(favs: Array<FavKey>) {
  const { data, isPending, error } = useQuery({
    queryKey: ['chess_profile', favs],
    queryFn: () => getChessProfilesForFavs(favs),
  })

  return { data, isPending, error }
}

export default useFetchChessProfileBulk
