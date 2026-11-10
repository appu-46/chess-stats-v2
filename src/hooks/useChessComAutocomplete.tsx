import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@mantine/hooks'
import { apiProfile, apiTitledPlayers } from '../services/apiStats'
import { searchChessProfiles } from '../services/apiUser'
import { limitConcurrency } from '../helpers/limitConcurrency'
import {
  CHESS_COM_TITLES,
  MAX_SUGGESTIONS,
  USERNAME_PATTERN,
  getRecentPlayers,
  mergeSuggestions,
} from '../helpers/playerSuggestions'
import useFamousPlayers from './useFamousPlayers'
import type { PlayerSuggestion } from '../helpers/playerSuggestions'

const DEBOUNCE_MS = 250
const MIN_LENGTH = 2
// The exact-account check is a request per pause in typing, so it waits
// for a username long enough to be worth asking about.
const EXACT_MIN_LENGTH = 3

// All ten title lists, two at a time (chess.com rate-limits parallel
// requests). A list that fails is left out rather than failing them all.
async function fetchTitledPlayers(): Promise<Array<PlayerSuggestion>> {
  const limit = limitConcurrency(2)
  const lists = await Promise.all(
    CHESS_COM_TITLES.map((title) =>
      limit(() => apiTitledPlayers(title))
        .then((players) =>
          players.map((username) => ({ username, title }) as PlayerSuggestion),
        )
        .catch(() => []),
    ),
  )
  return lists.flat()
}

// chess.com has no autocomplete endpoint; see helpers/playerSuggestions.
function useChessComAutocomplete(term: string, enabled: boolean) {
  const typed = term.trim()
  const [debounced] = useDebouncedValue(typed, DEBOUNCE_MS)
  const needle = debounced.toLowerCase()
  const searchable =
    enabled && needle.length >= MIN_LENGTH && USERNAME_PATTERN.test(needle)

  const famous = useFamousPlayers()

  // About 17,000 titled accounts, fetched the first time someone types
  // and kept for the visit.
  const { data: titled, isFetching: isFetchingTitled } = useQuery({
    queryKey: ['chessComTitled'],
    queryFn: fetchTitledPlayers,
    enabled: searchable,
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const { data: cached } = useQuery({
    queryKey: ['chessProfileSearch', 'chess.com', needle],
    queryFn: () => searchChessProfiles('chess.com', needle, MAX_SUGGESTIONS),
    enabled: searchable,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  // Does the username typed exist as it stands? Most don't, so a 404 here
  // is an answer, not an error.
  const { data: exact, isFetching: isFetchingExact } = useQuery({
    queryKey: ['chessComExact', needle],
    queryFn: async (): Promise<PlayerSuggestion | null> => {
      try {
        const profile = await apiProfile(needle)
        // The profile's url ends in the username as the player spells it.
        const username =
          String(profile.url ?? '')
            .split('/')
            .pop() || needle
        return { username, title: profile.title, name: profile.name }
      } catch {
        return null
      }
    },
    enabled: searchable && needle.length >= EXACT_MIN_LENGTH,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  if (!enabled) return { suggestions: [], isFetching: false }

  // Recent and famous players answer straight away, from what's typed;
  // the fetched sources follow the debounced term.
  const suggestions = mergeSuggestions(typed, {
    exact: needle === typed.toLowerCase() ? exact : null,
    recent: getRecentPlayers('chess.com'),
    famous: famous.filter((player) => player.platform === 'chess.com'),
    cached: searchable ? cached : [],
    titled: typed.length >= MIN_LENGTH ? titled : [],
  })

  return {
    suggestions,
    isFetching: searchable && (isFetchingTitled || isFetchingExact),
  }
}

export default useChessComAutocomplete
