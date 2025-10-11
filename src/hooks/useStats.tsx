import { useQuery } from '@tanstack/react-query'
import { apiStats } from '../services/apiStats'

function useStats(username?: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['stats', username],
    queryFn: () => apiStats(username!),
  })

  return { data, isPending, error }
}

export default useStats
