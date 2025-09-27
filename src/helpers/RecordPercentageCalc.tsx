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
  const percentageWins = parseFloat(((w / totalGames) * 100).toFixed(2))
  const percentageLosses = parseFloat(((l / totalGames) * 100).toFixed(2))
  const percentageDraws = parseFloat(((d / totalGames) * 100).toFixed(2))

  return { percentageDraws, percentageLosses, percentageWins }
}
