import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteFav } from '../services/apiUser'

export function useDeleteFav(sub: string) {
  const queryClient = useQueryClient()
  const { mutate, error } = useMutation({
    mutationFn: deleteFav,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favs', sub] }),
  })

  return { mutate, error }
}
