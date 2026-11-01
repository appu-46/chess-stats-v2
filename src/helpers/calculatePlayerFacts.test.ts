import { describe, expect, it } from 'vitest'
import {
  MIN_GAMES_FOR_FACTS,
  calculatePlayerFacts,
  ratingsFromStats,
} from './calculatePlayerFacts'
import type { PlayerStats } from './normalizePlayer'
import type { GameResult, TransformedGame } from './transformGame'

const ME = 'me'
const DAY = 86400

function game(
  overrides: Partial<TransformedGame> & {
    resultForPlayer: GameResult
    endTime: number
  },
): TransformedGame {
  return {
    BlackElo: '1500',
    PlayerELO: '1500',
    Result: '1-0',
    TimeControl: '180',
    WhiteElo: '1500',
    blackPlayer: 'opponent',
    date_time: '',
    gameEndDate: '',
    moveCount: 40,
    time_class: 'blitz',
    url: '',
    whitePlayer: ME,
    Termination: 'me won by resignation',
    opening: null,
    openingFamily: null,
    eco: null,
    ...overrides,
  }
}

// `count` blitz wins as white, a day apart, rating climbing by 10 a game.
function winningRun(count: number) {
  return Array.from({ length: count }, (_, i) =>
    game({
      resultForPlayer: 'win',
      endTime: i * DAY,
      PlayerELO: String(1500 + i * 10),
    }),
  )
}

describe('calculatePlayerFacts', () => {
  it('returns null below the minimum number of games', () => {
    const games = winningRun(MIN_GAMES_FOR_FACTS - 1)
    expect(calculatePlayerFacts(games, [], ME)).toBeNull()
    expect(calculatePlayerFacts(undefined, [], ME)).toBeNull()
  })

  it('finds the main time class, span and rating change', () => {
    const games = [
      ...winningRun(20),
      game({ resultForPlayer: 'loss', endTime: 5 * DAY, time_class: 'rapid' }),
    ]
    const facts = calculatePlayerFacts(games, [], ME)!
    expect(facts.gamesAnalyzed).toBe(21)
    expect(facts.spanDays).toBe(19)
    expect(facts.mainTimeClass).toEqual({
      timeClass: 'blitz',
      games: 20,
      sharePct: (20 / 21) * 100,
    })
    expect(facts.ratingChange).toEqual({
      timeClass: 'blitz',
      from: 1500,
      to: 1690,
      change: 190,
    })
  })

  it('ignores unrated games when measuring the rating change', () => {
    const games = winningRun(20)
    games[0].PlayerELO = ''
    const facts = calculatePlayerFacts(games, [], ME)!
    expect(facts.ratingChange?.from).toBe(1510)
  })

  it('scores each color, counting draws as half', () => {
    const games = [
      ...winningRun(18),
      game({ resultForPlayer: 'draw', endTime: 30 * DAY, whitePlayer: 'x' }),
      game({ resultForPlayer: 'loss', endTime: 31 * DAY, whitePlayer: 'x' }),
    ]
    const { scoreByColor } = calculatePlayerFacts(games, [], ME)!
    expect(scoreByColor.white).toEqual({ games: 18, scorePct: 100 })
    expect(scoreByColor.black).toEqual({ games: 2, scorePct: 25 })
  })

  it('picks the strongest time class only from ones with enough games', () => {
    const stats: PlayerStats = {
      blitz: {
        current: 2000,
        best: { rating: 2100, gameUrl: null },
        record: { win: 50, loss: 40, draw: 10 },
      },
      // Higher, but only three games: not trustworthy.
      daily: {
        current: 2400,
        best: null,
        record: { win: 3, loss: 0, draw: 0 },
      },
      rapid: {
        current: null,
        best: null,
        record: { win: 0, loss: 0, draw: 0 },
      },
    }
    const ratings = ratingsFromStats(stats, ['blitz', 'rapid', 'daily'])
    expect(ratings).toEqual([
      { timeClass: 'blitz', current: 2000, peak: 2100, games: 100 },
      { timeClass: 'daily', current: 2400, peak: null, games: 3 },
    ])
    const facts = calculatePlayerFacts(winningRun(20), ratings, ME)!
    expect(facts.strongestTimeClass).toBe('blitz')
  })

  it('reports how games are usually won and lost', () => {
    const games = [
      ...winningRun(20),
      ...[1, 2, 3].map((i) =>
        game({
          resultForPlayer: 'loss',
          endTime: (30 + i) * DAY,
          Termination: 'opponent won on time',
        }),
      ),
    ]
    const facts = calculatePlayerFacts(games, [], ME)!
    expect(facts.topWinMethod).toEqual({ category: 'Resignation', pct: 100 })
    expect(facts.topLossMethod).toEqual({ category: 'Timeout', pct: 100 })
    expect(facts.longestWinStreak).toBe(20)
    expect(facts.currentStreak).toEqual({ type: 'loss', count: 3 })
  })

  it('names the favourite opening per color and the average length', () => {
    const games = winningRun(20).map((g, i) => ({
      ...g,
      openingFamily: i < 15 ? 'Italian Game' : 'Ruy Lopez',
      moveCount: i % 2 ? 30 : 50,
    }))
    const facts = calculatePlayerFacts(games, [], ME)!
    expect(facts.favoriteOpenings.white).toEqual({
      name: 'Italian Game',
      games: 15,
    })
    expect(facts.favoriteOpenings.black).toBeNull()
    expect(facts.averageMoves).toBe(40)
  })
})
