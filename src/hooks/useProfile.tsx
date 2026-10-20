import { useQuery } from '@tanstack/react-query'
import { fetchPlayerProfile } from '../services/apiPlayer'
import { DEFAULT_PLATFORM } from '../helpers/platform'
import type { Platform } from '../helpers/platform'

function useProfile(username?: string, platform: Platform = DEFAULT_PLATFORM) {
  const { data, isPending, error } = useQuery({
    queryKey: ['profile', platform, username],
    queryFn: () => fetchPlayerProfile(platform, username!),
    enabled: !!username,
  })

  return { data, isPending, error }
}

export default useProfile
