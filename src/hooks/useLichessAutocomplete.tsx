import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@mantine/hooks'
import {
  LICHESS_AUTOCOMPLETE_MIN_LENGTH,
  apiLichessAutocomplete,
} from '../services/apiLichess'

const DEBOUNCE_MS = 250

function useLichessAutocomplete(term: string, enabled: boolean) {
  const [debouncedTerm] = useDebouncedValue(term.trim(), DEBOUNCE_MS)

  const { data, isFetching } = useQuery({
    queryKey: ['lichessAutocomplete', debouncedTerm.toLowerCase()],
    // TanStack Query aborts the signal when the key changes, so a slow
    // response for "mag" can't overwrite the results for "magnus".
    queryFn: ({ signal }) => apiLichessAutocomplete(debouncedTerm, signal),
    enabled: enabled && debouncedTerm.length >= LICHESS_AUTOCOMPLETE_MIN_LENGTH,
    staleTime: 5 * 60 * 1000,
  })

  return { suggestions: enabled ? (data ?? []) : [], isFetching }
}

export default useLichessAutocomplete
