type OpeningGame = {
  whitePlayer: string
  resultForPlayer: 'win' | 'loss' | 'draw'
  openingFamily: string | null
  endTime: number
}

export interface OpeningRecord {
  name: string
  color: 'white' | 'black'
  games: number
  wins: number
  losses: number
  draws: number
  // (wins + draws / 2) / games, as a percentage.
  scorePct: number
  // Change in how often this opening was played, in percentage points of the
  // player's games with that color: later half of the period vs earlier half.
  // null when there are too few games to say anything.
  trendPts: number | null
}

export interface OpeningStats {
  white: Array<OpeningRecord>
  black: Array<OpeningRecord>
  best: OpeningRecord | null
  worst: OpeningRecord | null
}

interface Options {
  // Openings shown per color.
  limit?: number
  // Minimum games for an opening to qualify as best/worst.
  minGames?: number
}

// Below this many games per color, an "earlier vs later half" split is
// mostly noise.
const MIN_GAMES_FOR_TREND = 10

function recordsForColor(
  games: Array<OpeningGame>,
  color: 'white' | 'black',
): Array<OpeningRecord> {
  const sorted = [...games].sort((a, b) => a.endTime - b.endTime)
  const midpoint = Math.floor(sorted.length / 2)
  const canTrend = sorted.length >= MIN_GAMES_FOR_TREND
  const earlyTotal = midpoint
  const lateTotal = sorted.length - midpoint

  const byName = new Map<
    string,
    OpeningRecord & { early: number; late: number }
  >()

  sorted.forEach((game, i) => {
    if (!game.openingFamily) return
    let record = byName.get(game.openingFamily)
    if (!record) {
      record = {
        name: game.openingFamily,
        color,
        games: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        scorePct: 0,
        trendPts: null,
        early: 0,
        late: 0,
      }
      byName.set(game.openingFamily, record)
    }
    record.games++
    if (game.resultForPlayer === 'win') record.wins++
    else if (game.resultForPlayer === 'loss') record.losses++
    else record.draws++
    if (i < midpoint) record.early++
    else record.late++
  })

  return Array.from(byName.values()).map(({ early, late, ...record }) => ({
    ...record,
    scorePct: ((record.wins + record.draws / 2) / record.games) * 100,
    trendPts: canTrend ? (late / lateTotal - early / earlyTotal) * 100 : null,
  }))
}

function byPopularity(a: OpeningRecord, b: OpeningRecord) {
  return b.games - a.games || a.name.localeCompare(b.name)
}

export function calculateOpeningStats(
  games: Array<OpeningGame> | undefined,
  username: string,
  { limit = 6, minGames = 5 }: Options = {},
): OpeningStats {
  if (!games?.length) return { white: [], black: [], best: null, worst: null }

  const lowerUsername = username.toLowerCase()
  const asWhite: Array<OpeningGame> = []
  const asBlack: Array<OpeningGame> = []
  for (const game of games) {
    if (game.whitePlayer.toLowerCase() === lowerUsername) asWhite.push(game)
    else asBlack.push(game)
  }

  const white = recordsForColor(asWhite, 'white').sort(byPopularity)
  const black = recordsForColor(asBlack, 'black').sort(byPopularity)

  // Best/worst look across every opening, not just the top `limit` shown.
  const qualified = [...white, ...black].filter((r) => r.games >= minGames)
  const byScore = [...qualified].sort(
    (a, b) => b.scorePct - a.scorePct || b.games - a.games,
  )
  const best = byScore[0] ?? null
  const worst = byScore.length > 1 ? byScore[byScore.length - 1] : null

  return {
    white: white.slice(0, limit),
    black: black.slice(0, limit),
    best,
    worst,
  }
}
