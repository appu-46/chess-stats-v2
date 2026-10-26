import { describe, expect, it } from 'vitest'
import { countryFromChessComCode, countryFromName } from './countries'
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

  it('picks the current code where an old one shares the name', () => {
    // SU (Soviet Union) is also "Russia", FX "France", UK "United
    // Kingdom" and YU "Serbia", and none of those have flags.
    expect(countryFromName('Russia')?.code).toBe('RU')
    expect(countryFromName('France')?.code).toBe('FR')
    expect(countryFromName('United Kingdom')?.code).toBe('GB')
    expect(countryFromName('Serbia')?.code).toBe('RS')
    expect(countryFromName('Germany')?.code).toBe('DE')
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
    expect(countryFromName(undefined)).toBeNull()
  })
})
