import { useQuery } from '@tanstack/react-query'
import { getChessProfileFromChessUsername } from '../services/apiUser'

export function useFetchChessprofileFromSupa(chessUserid: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['chess_profile'],
    queryFn: () => getChessProfileFromChessUsername(chessUserid),
  })

  return { data, isPending, error }
}
