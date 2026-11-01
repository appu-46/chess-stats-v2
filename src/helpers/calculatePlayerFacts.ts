// A player's notable numbers over their recent games: the only input the
// LLM-written profile summary gets (netlify/functions/player-summary.ts),
// so it can describe these facts but has nothing else to invent from.
import { calculateOpeningStats } from './calculateOpeningStats'
import { calculateStreaks } from './calculateStreaks'
import { calculateWinRateBreakdown } from './calculateWinRateBreakdown'
import type { TerminationCategory } from './calculateWinRateBreakdown'
import type { PlayerStats } from './normalizePlayer'
import type { TransformedGame } from './transformGame'

// Below this, percentages and streaks are mostly noise.
export const MIN_GAMES_FOR_FACTS = 20

// A time class needs this many lifetime games before it can count as the
// player's strongest; a 3-game daily rating says nothing.
const MIN_GAMES_FOR_STRONGEST = 20

export interface TimeClassRating {
  timeClass: string
  current: number
  peak: number | null
  // Lifetime rated games in this time class.
  games: number
}

export interface PlayerFacts {
  gamesAnalyzed: number
  // Days between the first and last game analyzed.
  spanDays: number
  mainTimeClass: { timeClass: string; games: number; sharePct: number } | null
  // Lifetime, in the caller's time-class order.
  ratings: Array<TimeClassRating>
  strongestTimeClass: string | null
  // In the main time class, first game of the window to the last.
  ratingChange: {
    timeClass: string
    from: number
    to: number
    change: number
  } | null
  // (wins + draws / 2) / games, as a percentage.
  scoreByColor: {
    white: { games: number; scorePct: number }
    black: { games: number; scorePct: number }
  }
  topWinMethod: { category: TerminationCategory; pct: number } | null
  topLossMethod: { category: TerminationCategory; pct: number } | null
  longestWinStreak: number
  currentStreak: { type: 'win' | 'loss' | 'draw'; count: number }
  winRateAfterWin: number
  winRateAfterLoss: number
  favoriteOpenings: {
    white: { name: string; games: number } | null
    black: { name: string; games: number } | null
  }
  averageMoves: number
}

function scorePct(wins: number, draws: number, games: number) {
  return games > 0 ? ((wins + draws / 2) / games) * 100 : 0
}

function rating(elo: string) {
  const value = Number(elo)
  return elo && Number.isFinite(value) && value > 0 ? value : null
}

// chess.com's /stats in the shape calculatePlayerFacts takes. Lichess's
// user record already gives ratings and game counts directly.
export function ratingsFromStats(
  stats: PlayerStats,
  timeClasses: Array<string>,
): Array<TimeClassRating> {
  const ratings: Array<TimeClassRating> = []
  for (const timeClass of timeClasses) {
    const stat = stats[timeClass]
    if (stat?.current == null) continue
    const { win, loss, draw } = stat.record
    ratings.push({
      timeClass,
      current: stat.current,
      peak: stat.best?.rating ?? null,
      games: win + loss + draw,
    })
  }
  return ratings
}

export function calculatePlayerFacts(
  games: Array<TransformedGame> | undefined,
  ratings: Array<TimeClassRating>,
  username: string,
): PlayerFacts | null {
  if (!games || games.length < MIN_GAMES_FOR_FACTS) return null

  let first = Infinity
  let last = -Infinity
  const perTimeClass = new Map<string, Array<TransformedGame>>()
  let totalMoves = 0
  for (const game of games) {
    first = Math.min(first, game.endTime)
    last = Math.max(last, game.endTime)
    totalMoves += game.moveCount
    const list = perTimeClass.get(game.time_class) ?? []
    list.push(game)
    perTimeClass.set(game.time_class, list)
  }

  let mainTimeClass: PlayerFacts['mainTimeClass'] = null
  for (const [timeClass, list] of perTimeClass) {
    if (!mainTimeClass || list.length > mainTimeClass.games) {
      mainTimeClass = {
        timeClass,
        games: list.length,
        sharePct: (list.length / games.length) * 100,
      }
    }
  }

  let ratingChange: PlayerFacts['ratingChange'] = null
  if (mainTimeClass) {
    const rated = perTimeClass
      .get(mainTimeClass.timeClass)!
      .map((game) => ({ endTime: game.endTime, elo: rating(game.PlayerELO) }))
      .filter((game): game is { endTime: number; elo: number } =>
        Boolean(game.elo),
      )
      .sort((a, b) => a.endTime - b.endTime)
    if (rated.length >= 2) {
      const from = rated[0].elo
      const to = rated[rated.length - 1].elo
      ratingChange = {
        timeClass: mainTimeClass.timeClass,
        from,
        to,
        change: to - from,
      }
    }
  }

  const strongest = ratings
    .filter((r) => r.games >= MIN_GAMES_FOR_STRONGEST)
    .sort((a, b) => b.current - a.current)
    .at(0)

  const breakdown = calculateWinRateBreakdown(games, username)
  const { white, black } = breakdown.byColor
  const streaks = calculateStreaks(games)
  const openings = calculateOpeningStats(games, username, { limit: 1 })
  const topOpening = (list: typeof openings.white) =>
    list[0] ? { name: list[0].name, games: list[0].games } : null

  const topWin = breakdown.winsByTermination.at(0)
  const topLoss = breakdown.lossesByTermination.at(0)

  return {
    gamesAnalyzed: games.length,
    spanDays: Math.round((last - first) / 86400),
    mainTimeClass,
    ratings,
    strongestTimeClass: strongest?.timeClass ?? null,
    ratingChange,
    scoreByColor: {
      white: {
        games: white.totalGames,
        scorePct: scorePct(white.wins, white.draws, white.totalGames),
      },
      black: {
        games: black.totalGames,
        scorePct: scorePct(black.wins, black.draws, black.totalGames),
      },
    },
    topWinMethod: topWin
      ? { category: topWin.category, pct: topWin.pct }
      : null,
    topLossMethod: topLoss
      ? { category: topLoss.category, pct: topLoss.pct }
      : null,
    longestWinStreak: streaks.longestWinStreak,
    currentStreak: streaks.currentStreak,
    winRateAfterWin: streaks.winRateAfterWin,
    winRateAfterLoss: streaks.winRateAfterLoss,
    favoriteOpenings: {
      white: topOpening(openings.white),
      black: topOpening(openings.black),
    },
    averageMoves: Math.round(totalMoves / games.length),
  }
}
