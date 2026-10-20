import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const DATE_TIME_FORMAT = 'DD-MMM-YYYY HH:mm:ss'

type StreakGame = {
  resultForPlayer: 'win' | 'loss' | 'draw'
  date_time: string
}

export interface StreakStats {
  currentStreak: { type: 'win' | 'loss' | 'draw'; count: number }
  longestWinStreak: number
  longestLossStreak: number
  winRateAfterWin: number
  winRateAfterLoss: number
}

const EMPTY_STATS: StreakStats = {
  currentStreak: { type: 'draw', count: 0 },
  longestWinStreak: 0,
  longestLossStreak: 0,
  winRateAfterWin: 0,
  winRateAfterLoss: 0,
}

export function calculateStreaks(
  games: Array<StreakGame> | undefined,
): StreakStats {
  if (!games?.length) return EMPTY_STATS

  const sorted = [...games].sort(
    (a, b) =>
      dayjs(a.date_time, DATE_TIME_FORMAT).valueOf() -
      dayjs(b.date_time, DATE_TIME_FORMAT).valueOf(),
  )

  let longestWinStreak = 0
  let longestLossStreak = 0
  let runType: 'win' | 'loss' | 'draw' = sorted[0].resultForPlayer
  let runLength = 0

  let winsAfterWin = 0
  let gamesAfterWin = 0
  let winsAfterLoss = 0
  let gamesAfterLoss = 0

  for (let i = 0; i < sorted.length; i++) {
    const { resultForPlayer } = sorted[i]

    if (resultForPlayer === runType) {
      runLength++
    } else {
      runType = resultForPlayer
      runLength = 1
    }

    if (runType === 'win') longestWinStreak = Math.max(longestWinStreak, runLength)
    if (runType === 'loss')
      longestLossStreak = Math.max(longestLossStreak, runLength)

    if (i > 0) {
      const previous = sorted[i - 1].resultForPlayer
      if (previous === 'win') {
        gamesAfterWin++
        if (resultForPlayer === 'win') winsAfterWin++
      } else if (previous === 'loss') {
        gamesAfterLoss++
        if (resultForPlayer === 'win') winsAfterLoss++
      }
    }
  }

  return {
    currentStreak: { type: runType, count: runLength },
    longestWinStreak,
    longestLossStreak,
    winRateAfterWin:
      gamesAfterWin > 0 ? (winsAfterWin / gamesAfterWin) * 100 : 0,
    winRateAfterLoss:
      gamesAfterLoss > 0 ? (winsAfterLoss / gamesAfterLoss) * 100 : 0,
  }
}
