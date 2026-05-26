// hooks/useGetUser.tsx
import { useQuery } from '@tanstack/react-query'
import { getUserFromChessId } from '../services/apiUser'

function useGetUser(username?: string) {
  const { data, isPending, error } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserFromChessId(username!),
    enabled: !!username,
  })

  return { data, isPending, error }
}

export default useGetUser
