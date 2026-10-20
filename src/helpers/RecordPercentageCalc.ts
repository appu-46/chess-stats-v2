// One decimal place throughout ("78.4%"), and 0% rather than NaN for a
// time control with no games.
function percentOf(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0
}

export function RecordPercentageCalc(
  record:
    | {
        win?: number | null
        loss?: number | null
        draw?: number | null
      }
    | null
    | undefined = {},
) {
  const w = record?.win ?? 0
  const l = record?.loss ?? 0
  const d = record?.draw ?? 0

  const totalGames = w + l + d
  const percentageWins = percentOf(w, totalGames)
  const percentageLosses = percentOf(l, totalGames)
  const percentageDraws = percentOf(d, totalGames)

  return { totalGames, percentageDraws, percentageLosses, percentageWins }
}
