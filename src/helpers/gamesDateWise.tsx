export function gamesDateWise(games: any) {
  if (!games) return
  const groupedByDate = games.reduce((acc: any, game: any) => {
    const date = game.gameEndDate
    if (!acc[date]) acc[date] = []
    acc[date].push(game)
    return acc
  }, {})
  return { groupedByDate }
}
