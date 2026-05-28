import { useMutation } from '@tanstack/react-query'
import { upsertFav } from '../services/apiUser'

function useUpsertFav() {
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: upsertFav,
  })

  return { mutate, mutateAsync, isPending, error }
}

export default useUpsertFav
