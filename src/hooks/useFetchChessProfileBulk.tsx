import { useQuery } from '@tanstack/react-query'
import { getUserFromPlayerID } from '../services/apiUser'

function useFetchChessProfileBulk(player_id_favs: Array<string>) {
  const { data, isPending, error } = useQuery({
    queryKey: ['chess_profile', player_id_favs],
    queryFn: () => getUserFromPlayerID(player_id_favs),
  })

  return { data, isPending, error }
}

export default useFetchChessProfileBulk
