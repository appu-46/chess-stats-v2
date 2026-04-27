import { useMutation } from '@tanstack/react-query'
import { updateChessUsername } from '../services/apiUser'

function useUpdateChessUsername() {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      sub,
      chessUsername,
    }: {
      sub: string
      chessUsername: string
    }) => updateChessUsername(sub, chessUsername),
  })

  return { mutateAsync, isPending, error }
}

export default useUpdateChessUsername
