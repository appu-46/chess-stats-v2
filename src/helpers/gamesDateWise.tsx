export function gamesDateWise(games: Array<any> | undefined) {
  if (!games?.length) return {}

  const groupedByDate: Record<string, Array<any> | undefined> = {}

  for (const game of games) {
    const date = game.gameEndDate
    ;(groupedByDate[date] ||= []).push(game)
  }

  return groupedByDate as Record<string, Array<any>>
}
