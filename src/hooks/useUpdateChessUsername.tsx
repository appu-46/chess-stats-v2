import { useMutation } from '@tanstack/react-query'
import { updateChessUsername } from '../services/apiUser'
import type { Platform } from '../helpers/platform'

function useUpdateChessUsername() {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      sub,
      chessUsername,
      platform,
    }: {
      sub: string
      chessUsername: string
      platform: Platform
    }) => updateChessUsername(sub, chessUsername, platform),
  })

  return { mutateAsync, isPending, error }
}

export default useUpdateChessUsername
