import { useQuery } from '@tanstack/react-query'
import { getFavs } from '../services/apiUser'

function useGetFavsofUser(sub: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['favs', sub],
    queryFn: () => getFavs(sub),
    enabled: !!sub,
  })

  return { data, isPending, error }
}

export default useGetFavsofUser
