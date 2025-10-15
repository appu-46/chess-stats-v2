type Game = {
  timecontrol: number
  black: { username: string; result: string }
  white: { username: string; result: string }
  pgn: string | null
  end_time: number
}
type GameResponse = { games: Array<Game> | [] }

export function transformGames(input: GameResponse | null, userame: string) {
  if (!input) return
  const playusername = userame
  const rawGameData = input.games
  console.log(rawGameData)
  const gamesData = rawGameData.map((game) => ({
    result:
      game.black.username.toLowerCase() === playusername.toLowerCase() &&
      game.black.result === 'win'
        ? 'win'
        : 'loss',
    pgn: game.pgn,
    timecontrol: game.timecontrol,
    datetime: game.end_time,
  }))

  return { gamesData }
}
