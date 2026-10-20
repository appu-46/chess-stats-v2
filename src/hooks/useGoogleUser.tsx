// hooks/useGoogleUser.tsx
import { useQuery } from '@tanstack/react-query'
import { getGoogleUser } from '../services/OAuth'
import useUpsertUser from './userUpseretUser'

// Refetched by the auth listener in main.tsx on sign-in and sign-out.
function useGoogleUser() {
  const { mutateAsync: saveUser } = useUpsertUser()

  const { data, isPending, error } = useQuery({
    queryKey: ['googleUser'],
    queryFn: async () => {
      const user = await getGoogleUser()
      if (!user) return null

      await saveUser({
        sub: user.sub,
        firstName: user.given_name ?? '',
        lastName: user.family_name ?? '',
        profileURL: user.picture ?? '',
        email: user.email ?? '',
      })
      return user
    },
    staleTime: Infinity,
  })

  return { data: data ?? undefined, isPending, error }
}

export default useGoogleUser
