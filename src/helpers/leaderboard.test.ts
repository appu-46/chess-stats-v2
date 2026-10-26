import { describe, expect, it } from 'vitest'
import { summarizeLeaderboard } from './leaderboard'
import { NO_COUNTRY } from './leaderboardSearch'
import type { LeaderboardEntry } from '../services/apiLeaderboard'

function entry(
  rank: number,
  title: string | null,
  country: string | null,
): LeaderboardEntry {
  return {
    rank,
    username: `p${rank}`,
    name: null,
    title,
    rating: 3000 - rank,
    country: country ? { code: 'XX', name: country } : null,
    avatar: null,
  }
}

const entries = [
  entry(1, 'GM', 'Norway'),
  entry(2, 'IM', 'India'),
  entry(3, 'GM', 'India'),
  entry(4, null, null),
  entry(5, 'LM', null),
  entry(6, 'GM', 'United States'),
  entry(7, 'FM', 'United States'),
]

describe('summarizeLeaderboard', () => {
  it('orders titles by rank, unofficial ones last', () => {
    const { titles } = summarizeLeaderboard(entries, {})
    expect(titles).toEqual([
      { title: 'GM', count: 3 },
      { title: 'IM', count: 1 },
      { title: 'FM', count: 1 },
      { title: 'LM', count: 1 },
    ])
  })

  it('counts countries most first, with no country set last', () => {
    const { countries } = summarizeLeaderboard(entries, {})
    expect(countries.map(({ key, count }) => [key, count])).toEqual([
      ['India', 2],
      ['United States', 2],
      ['Norway', 1],
      [NO_COUNTRY, 2],
    ])
  })

  it('counts countries among the chosen title, and keeps every title', () => {
    const summary = summarizeLeaderboard(entries, { title: 'GM' })
    expect(summary.countries.map(({ key }) => key)).toEqual([
      'India',
      'Norway',
      'United States',
    ])
    expect(summary.titles).toHaveLength(4)
    expect(summary.players.map((p) => p.rank)).toEqual([1, 3, 6])
  })

  it('applies both filters, in rank order', () => {
    expect(
      summarizeLeaderboard(entries, { title: 'GM', country: 'India' }).players,
    ).toEqual([entries[2]])
    expect(
      summarizeLeaderboard(entries, { country: NO_COUNTRY }).players.map(
        (p) => p.rank,
      ),
    ).toEqual([4, 5])
  })
})
