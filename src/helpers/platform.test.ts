import { describe, expect, it } from 'vitest'
import {
  parsePlatform,
  platformSearch,
  validatePlatformSearch,
} from './platform'

describe('platform search params', () => {
  it('only keeps a recognised non-default platform in the URL', () => {
    expect(validatePlatformSearch({ platform: 'lichess' })).toEqual({
      platform: 'lichess',
    })
    expect(validatePlatformSearch({ platform: 'chess.com' })).toEqual({})
    expect(validatePlatformSearch({ platform: 'fics' })).toEqual({})
    expect(validatePlatformSearch({})).toEqual({})
  })

  it('round-trips through platformSearch', () => {
    expect(platformSearch('lichess')).toEqual({ platform: 'lichess' })
    expect(platformSearch('chess.com')).toEqual({})
  })

  it('falls back to chess.com for anything unrecognised', () => {
    expect(parsePlatform('lichess')).toBe('lichess')
    expect(parsePlatform(undefined)).toBe('chess.com')
    expect(parsePlatform(42)).toBe('chess.com')
  })
})
