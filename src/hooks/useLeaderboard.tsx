import { useQuery } from '@tanstack/react-query'
import { fetchLeaderboard } from '../services/apiLeaderboard'
import type { Platform } from '../helpers/platform'

function useLeaderboard(platform: Platform, timeClass: string) {
  return useQuery({
    queryKey: ['leaderboard', platform, timeClass],
    queryFn: () => fetchLeaderboard(platform, timeClass),
    // The sites refresh their boards every few minutes at most.
    staleTime: 10 * 60 * 1000,
  })
}

export default useLeaderboard
