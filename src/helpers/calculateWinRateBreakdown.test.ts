import { describe, expect, it } from 'vitest'
import {
  calculateWinRateBreakdown,
  categorizeTermination,
} from './calculateWinRateBreakdown'

describe('categorizeTermination', () => {
  it('matches chess.com termination sentences to a category', () => {
    expect(categorizeTermination('Hikaru won by checkmate')).toBe('Checkmate')
    expect(categorizeTermination('Hikaru won by resignation')).toBe(
      'Resignation',
    )
    expect(categorizeTermination('Hikaru won on time')).toBe('Timeout')
    expect(categorizeTermination('Hikaru won by abandonment')).toBe(
      'Abandonment',
    )
    expect(categorizeTermination('Game drawn by stalemate')).toBe('Stalemate')
    expect(categorizeTermination('Game drawn by repetition')).toBe(
      'Repetition',
    )
    expect(categorizeTermination('Game drawn by insufficient material')).toBe(
      'Insufficient Material',
    )
    expect(categorizeTermination('Game drawn by 50-move rule')).toBe(
      '50-move Rule',
    )
    expect(categorizeTermination('Game drawn by agreement')).toBe('Agreement')
    expect(categorizeTermination(undefined)).toBe('Other')
    expect(categorizeTermination('something unexpected')).toBe('Other')
  })
})

describe('calculateWinRateBreakdown', () => {
  it('returns empty stats for no games', () => {
    const stats = calculateWinRateBreakdown([], 'Hikaru')
    expect(stats.byColor.white.totalGames).toBe(0)
    expect(stats.byColor.black.totalGames).toBe(0)
    expect(stats.winsByTermination).toEqual([])
    expect(stats.lossesByTermination).toEqual([])
  })

  it('splits games by whether the player had white or black', () => {
    const games = [
      {
        whitePlayer: 'Hikaru',
        resultForPlayer: 'win' as const,
        Termination: 'Hikaru won by checkmate',
      },
      {
        whitePlayer: 'Opponent',
        resultForPlayer: 'loss' as const,
        Termination: 'Opponent won on time',
      },
      {
        whitePlayer: 'hikaru',
        resultForPlayer: 'draw' as const,
        Termination: 'Game drawn by agreement',
      },
    ]
    const stats = calculateWinRateBreakdown(games, 'Hikaru')

    expect(stats.byColor.white).toMatchObject({
      wins: 1,
      losses: 0,
      draws: 1,
      totalGames: 2,
      winRatePct: 50,
    })
    expect(stats.byColor.black).toMatchObject({
      wins: 0,
      losses: 1,
      draws: 0,
      totalGames: 1,
      winRatePct: 0,
    })
  })

  it('buckets wins and losses into termination categories independently', () => {
    const games = [
      {
        whitePlayer: 'Hikaru',
        resultForPlayer: 'win' as const,
        Termination: 'Hikaru won by checkmate',
      },
      {
        whitePlayer: 'Hikaru',
        resultForPlayer: 'win' as const,
        Termination: 'Hikaru won by resignation',
      },
      {
        whitePlayer: 'Hikaru',
        resultForPlayer: 'win' as const,
        Termination: 'Hikaru won by resignation',
      },
      {
        whitePlayer: 'Opponent',
        resultForPlayer: 'loss' as const,
        Termination: 'Opponent won on time',
      },
    ]
    const stats = calculateWinRateBreakdown(games, 'Hikaru')

    expect(stats.winsByTermination).toEqual([
      { category: 'Resignation', count: 2, pct: (2 / 3) * 100 },
      { category: 'Checkmate', count: 1, pct: (1 / 3) * 100 },
    ])
    expect(stats.lossesByTermination).toEqual([
      { category: 'Timeout', count: 1, pct: 100 },
    ])
  })
})
