import { useQuery } from '@tanstack/react-query'
import { apiProfile } from '../services/apiStats'

function useProfile(username?: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => apiProfile(username!),
  })

  return { data, isPending, error }
}

export default useProfile
