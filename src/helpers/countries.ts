import type { Country } from './normalizePlayer'

// Country names, flags and the sites' own non-ISO codes, so a player
// shows under the same country whichever site or endpoint they came from.

let regionNames: Intl.DisplayNames | null | undefined

export function regionName(code: string): string {
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
    } catch {
      regionNames = null
    }
  }
  try {
    return regionNames?.of(code) ?? code
  } catch {
    return code
  }
}

// chess.com's codes for places that aren't ISO countries. Like lichess's
// subdivisions (see normalizePlayer), they take the parent country's flag.
const CHESS_COM_CODES: Partial<Record<string, Country>> = {
  XA: { code: 'ES', name: 'Canary Islands' },
  XB: { code: 'ES', name: 'Basque Country' },
  XC: { code: 'ES', name: 'Catalonia' },
  XE: { code: 'GB', name: 'England' },
  XG: { code: 'ES', name: 'Galicia' },
  XK: { code: 'XK', name: 'Kosovo' },
  XP: { code: 'PS', name: 'Palestine' },
  XS: { code: 'GB', name: 'Scotland' },
  XW: { code: 'GB', name: 'Wales' },
  XX: { code: 'XX', name: 'International' },
}

// Names chess.com writes differently from the standard English ones.
const NAME_ALIASES: Partial<Record<string, string>> = {
  turkey: 'TR',
  'czech republic': 'CZ',
  'hong kong': 'HK',
  macau: 'MO',
  'ivory coast': 'CI',
  'cape verde': 'CV',
  myanmar: 'MM',
  macedonia: 'MK',
  swaziland: 'SZ',
  'palestinian territories': 'XP',
  'united states of america': 'US',
}

export function countryFromChessComCode(code: string): Country {
  return CHESS_COM_CODES[code] ?? { code, name: regionName(code) }
}

function isCurrentRegion(code: string) {
  try {
    return Intl.getCanonicalLocales(`und-${code}`)[0] === `und-${code}`
  } catch {
    return false
  }
}

let codesByName: Map<string, string> | undefined

function chessComCodeForName(name: string): string | undefined {
  if (!codesByName) {
    codesByName = new Map()
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (const a of letters) {
      for (const b of letters) {
        const code = a + b
        // Retired codes share their successor's name (SU is "Russia",
        // FX "France", UK "United Kingdom"), and have no flag: skip them.
        if (!isCurrentRegion(code)) continue
        const known = regionName(code)
        if (known !== code) codesByName.set(known.toLowerCase(), code)
      }
    }
    for (const [code, country] of Object.entries(CHESS_COM_CODES)) {
      if (country) codesByName.set(country.name.toLowerCase(), code)
    }
    for (const [alias, code] of Object.entries(NAME_ALIASES)) {
      if (code) codesByName.set(alias, code)
    }
  }
  return codesByName.get(name.trim().toLowerCase())
}

// chess.com's website leaderboard names countries ("Turkey") rather than
// coding them. Unknown names keep their text, with no flag.
export function countryFromName(name: string | undefined): Country | null {
  if (!name) return null
  const code = chessComCodeForName(name)
  return code ? countryFromChessComCode(code) : { code: 'XX', name }
}

