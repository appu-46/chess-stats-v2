export const PLATFORMS = ['chess.com', 'lichess'] as const

export type Platform = (typeof PLATFORMS)[number]

export const DEFAULT_PLATFORM: Platform = 'chess.com'

export const PLATFORM_LABELS: Record<Platform, string> = {
  'chess.com': 'Chess.com',
  lichess: 'Lichess',
}

export function isPlatform(value: unknown): value is Platform {
  return typeof value === 'string' && PLATFORMS.includes(value as Platform)
}

export function parsePlatform(value: unknown): Platform {
  return isPlatform(value) ? value : DEFAULT_PLATFORM
}

// Search-param shape shared by every player-scoped route. `platform` is left
// out of the URL for chess.com so existing links keep working unchanged.
export type PlatformSearch = { platform?: Platform }

export function validatePlatformSearch(
  search: Record<string, unknown>,
): PlatformSearch {
  return search.platform === 'lichess' ? { platform: 'lichess' } : {}
}

export function platformSearch(platform: Platform): PlatformSearch {
  return platform === DEFAULT_PLATFORM ? {} : { platform }
}
