import { NO_COUNTRY } from './leaderboardSearch'
import type { LeaderboardEntry } from '../services/apiLeaderboard'
import type { Country } from './normalizePlayer'

// Highest first; anything else (LM, BOT...) after these, alphabetically.
const TITLE_ORDER = ['GM', 'IM', 'WGM', 'FM', 'WIM', 'CM', 'WFM', 'NM', 'WCM']

export interface CountryCount {
  // The filter value: the country's name, or NO_COUNTRY.
  key: string
  country: Country | null
  count: number
}

export interface LeaderboardSummary {
  // Among all 100, so the title filter's options don't vanish as the
  // country filter narrows the list.
  titles: Array<{ title: string; count: number }>
  // Among players with the chosen title, most players first.
  countries: Array<CountryCount>
  // Both filters applied, in rank order.
  players: Array<LeaderboardEntry>
}

function countryKey(entry: LeaderboardEntry) {
  return entry.country?.name ?? NO_COUNTRY
}

function titleRank(title: string) {
  const index = TITLE_ORDER.indexOf(title)
  return index === -1 ? TITLE_ORDER.length : index
}

export function summarizeLeaderboard(
  entries: Array<LeaderboardEntry>,
  { country, title }: { country?: string; title?: string },
): LeaderboardSummary {
  const titleCounts = new Map<string, number>()
  for (const entry of entries) {
    if (entry.title) {
      titleCounts.set(entry.title, (titleCounts.get(entry.title) ?? 0) + 1)
    }
  }
  const titles = [...titleCounts]
    .map(([name, count]) => ({ title: name, count }))
    .sort(
      (a, b) =>
        titleRank(a.title) - titleRank(b.title) ||
        a.title.localeCompare(b.title),
    )

  const withTitle = title
    ? entries.filter((entry) => entry.title === title)
    : entries

  const countryCounts = new Map<string, CountryCount>()
  for (const entry of withTitle) {
    const key = countryKey(entry)
    const current = countryCounts.get(key)
    if (current) current.count++
    else countryCounts.set(key, { key, country: entry.country, count: 1 })
  }
  // Most players first; "no country set" last, whatever its size.
  const countries = [...countryCounts.values()].sort(
    (a, b) =>
      Number(a.key === NO_COUNTRY) - Number(b.key === NO_COUNTRY) ||
      b.count - a.count ||
      a.key.localeCompare(b.key),
  )

  const players = country
    ? withTitle.filter((entry) => countryKey(entry) === country)
    : withTitle

  return { titles, countries, players }
}
