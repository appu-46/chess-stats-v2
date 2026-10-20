import { useQuery } from '@tanstack/react-query'
import { fetchMonthGames } from '../services/apiPlayer'
import { DEFAULT_PLATFORM } from '../helpers/platform'
import type { Platform } from '../helpers/platform'

function useGames(
  username: string,
  year: string,
  month: string,
  platform: Platform = DEFAULT_PLATFORM,
) {
  const { data, isPending, error } = useQuery({
    queryKey: ['games', platform, username, month, year],
    queryFn: () => fetchMonthGames(platform, username, year, month),
  })

  return { games: data, isPending, error }
}

export default useGames
