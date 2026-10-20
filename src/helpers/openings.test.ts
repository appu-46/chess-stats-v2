import { describe, expect, it } from 'vitest'
import { openingFamily, parseChessComOpening } from './openings'

const URL = 'https://www.chess.com/openings/'

describe('parseChessComOpening', () => {
  it('turns the ECOUrl slug into a name and drops a hyphenated move suffix', () => {
    expect(
      parseChessComOpening(
        `${URL}Scandinavian-Defense-Mieses-Kotrc-Variation-3.Nf3`,
      ),
    ).toBe('Scandinavian Defense Mieses Kotrc Variation')
    expect(parseChessComOpening(`${URL}Alapin-Sicilian-Defense-2...Qa5`)).toBe(
      'Alapin Sicilian Defense',
    )
  })

  it('drops a move suffix glued on with an ellipsis', () => {
    expect(
      parseChessComOpening(
        `${URL}Queens-Pawn-Opening...2.g3-g6-3.Bg2-Bg7-4.Nf3`,
      ),
    ).toBe('Queens Pawn Opening')
    expect(
      parseChessComOpening(
        `${URL}Indian-Game-Knights-Variation-East-Indian-Defense...4.Bb2-O-O-5.e3-d6`,
      ),
    ).toBe('Indian Game Knights Variation East Indian Defense')
  })

  it('keeps names that have no move suffix, including in-name hyphens as spaces', () => {
    expect(parseChessComOpening(`${URL}Trompowsky-Attack`)).toBe(
      'Trompowsky Attack',
    )
    expect(
      parseChessComOpening(
        `${URL}Caro-Kann-Defense-Two-Knights-Attack-3...dxe4`,
      ),
    ).toBe('Caro Kann Defense Two Knights Attack')
  })

  it('returns null when there is nothing to parse', () => {
    expect(parseChessComOpening(undefined)).toBeNull()
    expect(parseChessComOpening('')).toBeNull()
    expect(parseChessComOpening('https://www.chess.com/openings/')).toBeNull()
  })
})

describe('openingFamily', () => {
  it('uses the part before the colon for lichess-style names', () => {
    expect(openingFamily('Sicilian Defense: Najdorf Variation')).toBe(
      'Sicilian Defense',
    )
    expect(openingFamily('Nimzo-Larsen Attack: Modern Variation')).toBe(
      'Nimzo-Larsen Attack',
    )
    expect(
      openingFamily(
        "King's Gambit Accepted: King's Knight Gambit, Bonsch-Osmolovsky",
      ),
    ).toBe("King's Gambit Accepted")
  })

  it('cuts chess.com names at the first family-ending word', () => {
    expect(openingFamily('Sicilian Defense Kan Modern Variation')).toBe(
      'Sicilian Defense',
    )
    expect(openingFamily('Queens Gambit Declined Exchange Variation')).toBe(
      'Queens Gambit',
    )
    expect(openingFamily('Italian Game Two Knights Defense')).toBe(
      'Italian Game',
    )
    expect(openingFamily('Ruy Lopez Opening Morphy Defense')).toBe(
      'Ruy Lopez Opening',
    )
    expect(openingFamily('Trompowsky Attack')).toBe('Trompowsky Attack')
  })

  it('falls back to the first two words when no family word appears', () => {
    expect(openingFamily("Queen's Indian Accelerated")).toBe("Queen's Indian")
    expect(openingFamily('Sicilian')).toBe('Sicilian')
  })

  it('returns null for missing names', () => {
    expect(openingFamily(null)).toBeNull()
    expect(openingFamily('')).toBeNull()
  })
})
