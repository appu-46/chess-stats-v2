import { useSearch } from '@tanstack/react-router'
import { parsePlatform } from '../helpers/platform'
import type { Platform } from '../helpers/platform'

// Reads the active platform off the current route's search params, so any
// component under a player-scoped route can ask without prop drilling.
function usePlatform(): Platform {
  return useSearch({
    strict: false,
    select: (search) =>
      parsePlatform((search as { platform?: unknown }).platform),
  })
}

export default usePlatform
