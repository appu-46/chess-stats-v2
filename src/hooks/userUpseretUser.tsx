import { useMutation } from '@tanstack/react-query'
import { upsertUser } from '../services/apiUser'

function useUpsertUser() {
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: upsertUser,
  })

  return { mutate, mutateAsync, isPending, error }
}

export default useUpsertUser
