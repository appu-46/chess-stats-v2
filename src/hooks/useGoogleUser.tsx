// hooks/useGoogleUser.tsx
import { useQuery } from '@tanstack/react-query'
import { fetchGoogleUser } from '../services/OAuth'

function useGoogleUser() {
  const token = sessionStorage.getItem('access_token')

  const { data, isPending, error } = useQuery({
    queryKey: ['googleUser'],
    queryFn: () => fetchGoogleUser(token!),
    enabled: !!token,
  })

  return { data, isPending, error }
}

export default useGoogleUser
