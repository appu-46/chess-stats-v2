import { describe, expect, it } from 'vitest'
import { calculateOpeningStats } from './calculateOpeningStats'

type Result = 'win' | 'loss' | 'draw'

let clock = 1_700_000_000
function game(
  color: 'white' | 'black',
  openingFamily: string | null,
  resultForPlayer: Result,
) {
  clock += 60
  return {
    whitePlayer: color === 'white' ? 'Hikaru' : 'Opponent',
    resultForPlayer,
    openingFamily,
    endTime: clock,
  }
}

describe('calculateOpeningStats', () => {
  it('returns empty stats for no games', () => {
    expect(calculateOpeningStats([], 'hikaru')).toEqual({
      white: [],
      black: [],
      best: null,
      worst: null,
    })
  })

  it('groups by color and opening, sorted by games played', () => {
    const stats = calculateOpeningStats(
      [
        game('white', 'Italian Game', 'win'),
        game('white', 'Italian Game', 'draw'),
        game('white', 'Italian Game', 'loss'),
        game('white', 'Ruy Lopez Opening', 'win'),
        game('black', 'Sicilian Defense', 'win'),
        game('black', null, 'loss'),
      ],
      'hikaru',
    )

    expect(stats.white.map((r) => [r.name, r.games])).toEqual([
      ['Italian Game', 3],
      ['Ruy Lopez Opening', 1],
    ])
    expect(stats.white[0]).toMatchObject({
      color: 'white',
      wins: 1,
      draws: 1,
      losses: 1,
      scorePct: 50,
    })
    // Games without a known opening are left out rather than bucketed.
    expect(stats.black.map((r) => r.name)).toEqual(['Sicilian Defense'])
  })

  it('caps each color at the limit', () => {
    const games = ['A', 'B', 'C', 'D'].map((name) => game('white', name, 'win'))
    expect(
      calculateOpeningStats(games, 'hikaru', { limit: 2 }).white,
    ).toHaveLength(2)
  })

  it('picks best and worst only among openings with enough games', () => {
    const games = [
      ...Array.from({ length: 5 }, () => game('white', 'Italian Game', 'win')),
      ...Array.from({ length: 5 }, () =>
        game('black', 'French Defense', 'loss'),
      ),
      // A perfect score on a single game must not win "best".
      game('black', 'Englund Gambit', 'win'),
    ]
    const stats = calculateOpeningStats(games, 'hikaru', { minGames: 5 })
    expect(stats.best?.name).toBe('Italian Game')
    expect(stats.worst?.name).toBe('French Defense')
  })

  it('has no worst opening when only one qualifies', () => {
    const games = Array.from({ length: 5 }, () =>
      game('white', 'Italian Game', 'win'),
    )
    const stats = calculateOpeningStats(games, 'hikaru', { minGames: 5 })
    expect(stats.best?.name).toBe('Italian Game')
    expect(stats.worst).toBeNull()
  })

  it('measures the usage trend between the earlier and later half', () => {
    // 10 white games: the London only shows up in the later half.
    const games = [
      ...Array.from({ length: 5 }, () => game('white', 'Italian Game', 'win')),
      ...Array.from({ length: 3 }, () => game('white', 'London System', 'win')),
      ...Array.from({ length: 2 }, () => game('white', 'Italian Game', 'win')),
    ]
    const stats = calculateOpeningStats(games, 'hikaru')
    const london = stats.white.find((r) => r.name === 'London System')
    const italian = stats.white.find((r) => r.name === 'Italian Game')
    expect(london?.trendPts).toBeCloseTo(60) // 0/5 -> 3/5
    expect(italian?.trendPts).toBeCloseTo(-60) // 5/5 -> 2/5
  })

  it('reports no trend when there are too few games', () => {
    const stats = calculateOpeningStats(
      [
        game('white', 'Italian Game', 'win'),
        game('white', 'Italian Game', 'win'),
      ],
      'hikaru',
    )
    expect(stats.white[0].trendPts).toBeNull()
  })
})
