import { useMutation } from '@tanstack/react-query'
import { upsertChessUser } from '../services/apiUser'

function useUpsertChessUser() {
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: upsertChessUser,
  })

  return { mutate, mutateAsync, isPending, error }
}

export default useUpsertChessUser
