import { describe, expect, it } from 'vitest'
import { countryFromChessComCode, countryFromName, flagSrc } from './countries'
import { lichessFlagToCountry } from './normalizePlayer'

describe('countries', () => {
  it('names a country the same from a code or from chess.com’s wording', () => {
    expect(countryFromName('Turkey')).toEqual(countryFromChessComCode('TR'))
    expect(countryFromName('Czech Republic')).toEqual(
      countryFromChessComCode('CZ'),
    )
    expect(countryFromName('United States')).toEqual({
      code: 'US',
      name: 'United States',
    })
  })

  it("matches chess.com's own codes with lichess's subdivisions", () => {
    expect(countryFromName('England')).toEqual({ code: 'GB', name: 'England' })
    expect(countryFromChessComCode('XE')).toEqual(
      lichessFlagToCountry('GB-ENG'),
    )
  })

  it('keeps an unknown name, without a flag', () => {
    const country = countryFromName('Atlantis')
    expect(country).toEqual({ code: 'XX', name: 'Atlantis' })
    expect(flagSrc(country!)).toBeNull()
    expect(countryFromName(undefined)).toBeNull()
    expect(flagSrc({ code: 'IN', name: 'India' })).toContain('/IN/')
  })
})
