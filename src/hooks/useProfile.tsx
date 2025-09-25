import { useQuery } from '@tanstack/react-query'
import { apiProfile } from '../services/apiStats'

function useProfile(username?: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['stats', username],
    queryFn: () => apiProfile(username!),
    enabled: !!username,
  })

  return { data, isPending, error }
}

export default useProfile
