// hooks/useGoogleUser.tsx
import { useQuery } from '@tanstack/react-query'
import { fetchGoogleUser } from '../services/OAuth'
import useUpsertUser from './userUpseretUser'

function useGoogleUser() {
  const token = sessionStorage.getItem('access_token')
  const { mutateAsync: saveUser } = useUpsertUser()

  const { data, isPending, error } = useQuery({
    queryKey: ['googleUser'],
    queryFn: async () => {
      const user = await fetchGoogleUser(token!)
      // Upsert happens here, once, when the query resolves
      await saveUser({
        sub: user.sub,
        firstName: user.given_name,
        lastName: user.family_name,
        profileURL: user.picture,
        email: user.email,
      })
      return user
    },
    enabled: !!token,
  })

  return { data, isPending, error }
}

export default useGoogleUser
