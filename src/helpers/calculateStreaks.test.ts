import { describe, expect, it } from 'vitest'
import { calculateStreaks } from './calculateStreaks'

function game(resultForPlayer: 'win' | 'loss' | 'draw', date_time: string) {
  return { resultForPlayer, date_time }
}

describe('calculateStreaks', () => {
  it('returns empty stats for no games', () => {
    expect(calculateStreaks([])).toEqual({
      currentStreak: { type: 'draw', count: 0 },
      longestWinStreak: 0,
      longestLossStreak: 0,
      winRateAfterWin: 0,
      winRateAfterLoss: 0,
    })
  })

  it('tracks the current streak from the most recent game backwards', () => {
    const games = [
      game('loss', '01-Jan-2026 10:00:00'),
      game('win', '02-Jan-2026 10:00:00'),
      game('win', '03-Jan-2026 10:00:00'),
    ]
    expect(calculateStreaks(games).currentStreak).toEqual({
      type: 'win',
      count: 2,
    })
  })

  it('finds the longest win and loss streaks regardless of input order', () => {
    // Shuffled on purpose - the helper must sort by date_time itself.
    const games = [
      game('win', '04-Jan-2026 10:00:00'),
      game('win', '02-Jan-2026 10:00:00'),
      game('loss', '01-Jan-2026 10:00:00'),
      game('win', '03-Jan-2026 10:00:00'),
      game('loss', '06-Jan-2026 10:00:00'),
      game('loss', '05-Jan-2026 10:00:00'),
    ]
    const stats = calculateStreaks(games)
    expect(stats.longestWinStreak).toBe(3)
    expect(stats.longestLossStreak).toBe(2)
  })

  it('computes win rate after a win vs after a loss', () => {
    const games = [
      game('win', '01-Jan-2026 10:00:00'),
      game('win', '02-Jan-2026 10:00:00'), // after win: win
      game('loss', '03-Jan-2026 10:00:00'), // after win: loss
      game('win', '04-Jan-2026 10:00:00'), // after loss: win
      game('loss', '05-Jan-2026 10:00:00'), // after win: loss
    ]
    const stats = calculateStreaks(games)
    // games after a win: (win@02 after win@01)=win, (loss@03 after win@02)=loss, (loss@05 after win@04)=loss
    expect(stats.winRateAfterWin).toBeCloseTo((1 / 3) * 100)
    // games after a loss: (win@04 after loss@03)=win
    expect(stats.winRateAfterLoss).toBeCloseTo(100)
  })

  it('treats a draw as breaking both win and loss streaks', () => {
    const games = [
      game('win', '01-Jan-2026 10:00:00'),
      game('win', '02-Jan-2026 10:00:00'),
      game('draw', '03-Jan-2026 10:00:00'),
      game('win', '04-Jan-2026 10:00:00'),
    ]
    const stats = calculateStreaks(games)
    expect(stats.longestWinStreak).toBe(2)
    expect(stats.currentStreak).toEqual({ type: 'win', count: 1 })
  })
})
