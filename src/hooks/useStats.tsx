import { useQuery } from '@tanstack/react-query'
import { fetchPlayerStats } from '../services/apiPlayer'
import { DEFAULT_PLATFORM } from '../helpers/platform'
import type { Platform } from '../helpers/platform'

function useStats(username?: string, platform: Platform = DEFAULT_PLATFORM) {
  const { data, isPending, error, isSuccess } = useQuery({
    queryKey: ['stats', platform, username],
    queryFn: () => fetchPlayerStats(platform, username!),
    enabled: !!username,
  })

  return { data, isPending, error, isSuccess }
}

export default useStats
