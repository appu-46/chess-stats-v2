export function gamesDateWise(games: Array<any> | undefined) {
  if (!games?.length) return {}

  const groupedByDate: Record<string, Array<any>> = {}

  for (const game of games) {
    const date = game.gameEndDate
    // Use ||= to fix ESLint error - cleaner than if-else
    ;(groupedByDate[date] ||= []).push(game)
  }

  return groupedByDate
}
