import { useQuery } from '@tanstack/react-query'
import { apiArchive } from '../services/apiStats'
import type { Platform } from '../helpers/platform'

// Months ('YYYY-MM') a chess.com player has a game archive for, so the month
// picker can disable the empty ones. Lichess has no archive list, so this
// is undefined there and callers fall back to the joined-date range.
function useArchiveMonths(username: string, platform: Platform) {
  const { data } = useQuery({
    queryKey: ['archives', platform, username.toLowerCase()],
    queryFn: async () => {
      const { archives } = (await apiArchive(username)) as {
        archives: Array<string>
      }
      // ".../games/2026/09" -> "2026-09"
      return new Set(archives.map((url) => url.split('/').slice(-2).join('-')))
    },
    enabled: platform === 'chess.com' && !!username,
  })

  return data
}

export default useArchiveMonths
