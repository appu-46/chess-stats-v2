export type TerminationCategory =
  | 'Checkmate'
  | 'Resignation'
  | 'Timeout'
  | 'Abandonment'
  | 'Stalemate'
  | 'Agreement'
  | 'Repetition'
  | 'Insufficient Material'
  | '50-move Rule'
  | 'Other'

export interface ColorRecord {
  wins: number
  losses: number
  draws: number
  totalGames: number
  winRatePct: number
}

export interface TerminationSlice {
  category: TerminationCategory
  count: number
  pct: number
}

export interface WinRateBreakdownStats {
  byColor: { white: ColorRecord; black: ColorRecord }
  winsByTermination: Array<TerminationSlice>
  lossesByTermination: Array<TerminationSlice>
}

type BreakdownGame = {
  whitePlayer: string
  resultForPlayer: 'win' | 'loss' | 'draw'
  Termination?: string
}

// chess.com's Termination header is a full sentence (e.g. "Hikaru won by
// checkmate", "Game drawn by insufficient material") rather than a clean
// enum, so this matches on the distinguishing substring.
export function categorizeTermination(
  termination: string | undefined,
): TerminationCategory {
  const t = (termination ?? '').toLowerCase()
  if (t.includes('checkmate')) return 'Checkmate'
  if (t.includes('resignation')) return 'Resignation'
  if (t.includes('abandon')) return 'Abandonment'
  if (t.includes('time')) return 'Timeout'
  if (t.includes('stalemate')) return 'Stalemate'
  if (t.includes('repetition')) return 'Repetition'
  if (t.includes('insufficient material')) return 'Insufficient Material'
  if (t.includes('50-move') || t.includes('fifty')) return '50-move Rule'
  if (t.includes('agreement')) return 'Agreement'
  return 'Other'
}

function emptyColorRecord(): ColorRecord {
  return { wins: 0, losses: 0, draws: 0, totalGames: 0, winRatePct: 0 }
}

function terminationSlices(
  games: Array<BreakdownGame>,
): Array<TerminationSlice> {
  const counts = new Map<TerminationCategory, number>()
  for (const game of games) {
    const category = categorizeTermination(game.Termination)
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }

  const total = games.length
  return Array.from(counts.entries())
    .map(([category, count]) => ({
      category,
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function calculateWinRateBreakdown(
  games: Array<BreakdownGame> | undefined,
  username: string,
): WinRateBreakdownStats {
  const white = emptyColorRecord()
  const black = emptyColorRecord()

  if (!games?.length) {
    return {
      byColor: { white, black },
      winsByTermination: [],
      lossesByTermination: [],
    }
  }

  const lowerUsername = username.toLowerCase()
  const wins: Array<BreakdownGame> = []
  const losses: Array<BreakdownGame> = []

  for (const game of games) {
    const isWhite = game.whitePlayer.toLowerCase() === lowerUsername
    const record = isWhite ? white : black
    record.totalGames++

    if (game.resultForPlayer === 'win') {
      record.wins++
      wins.push(game)
    } else if (game.resultForPlayer === 'loss') {
      record.losses++
      losses.push(game)
    } else {
      record.draws++
    }
  }

  white.winRatePct = white.totalGames > 0 ? (white.wins / white.totalGames) * 100 : 0
  black.winRatePct = black.totalGames > 0 ? (black.wins / black.totalGames) * 100 : 0

  return {
    byColor: { white, black },
    winsByTermination: terminationSlices(wins),
    lossesByTermination: terminationSlices(losses),
  }
}
