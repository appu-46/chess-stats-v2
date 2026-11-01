import { useQuery } from '@tanstack/react-query'
import { getFamousPlayers } from '../services/apiFamousPlayers'
import type { FamousPlayer } from '../services/apiFamousPlayers'

// Shown until the table answers, and if it can't: the homepage's chips
// shouldn't flash empty or vanish. The table's first rows, in its order.
const FALLBACK: Array<FamousPlayer> = [
  {
    platform: 'chess.com',
    username: 'Hikaru',
    name: 'Hikaru Nakamura',
    tagline: 'Grandmaster and streamer',
  },
  {
    platform: 'chess.com',
    username: 'MagnusCarlsen',
    name: 'Magnus Carlsen',
    tagline: 'Five-time world champion',
  },
  {
    platform: 'chess.com',
    username: 'samayraina',
    name: 'Samay Raina',
    tagline: 'Comedian and chess streamer',
  },
]

// The famous players list, in its display order. Edited by hand, so it's
// fetched once per visit.
function useFamousPlayers(): Array<FamousPlayer> {
  const { data } = useQuery({
    queryKey: ['famous_players'],
    queryFn: getFamousPlayers,
    staleTime: Infinity,
  })

  return data?.length ? data : FALLBACK
}

export default useFamousPlayers
