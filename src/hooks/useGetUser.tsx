// hooks/useGetUser.tsx
import { useQuery } from '@tanstack/react-query'
import { getUser } from '../services/apiUser'

function useGetUser(sub?: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['user', sub],
    queryFn: () => getUser(sub!),
    enabled: !!sub,
  })

  return { data, isPending, error }
}

export default useGetUser
