import { Chess } from 'chess.js'
import { formatDate } from './DateFormat'

type Game = {
  url: string
  time_control: string
  black: { username: string; result: string }
  white: { username: string; result: string }
  pgn: string
  end_time: number
  time_class: string
  result: string
  rules?: string
}

type GameResponse = { games: Array<Game> | [] }

export function transformGames(input: GameResponse | null, username: string) {
  if (!input) return
  const playusername = username
  const rawGameData = input.games
  const chess960Games: Array<any> = []
  const standardgamesData: Array<any> = []

  rawGameData.forEach((game) => {
    const ischess960 = game.rules == 'chess960'
    if (ischess960) {
      chess960Games.push({
        date: formatDate(game.end_time),
        result: game.result,
        whitePlayer: game.white.username,
        blackPlayer: game.black.username,
        pgn: game.pgn,
        url: game.url,
      })
    } else {
      const chess = new Chess()
      chess.loadPgn(game.pgn)
      const headers = chess.getHeaders()
      const {
        White: whitePlayer,
        Black: blackPlayer,
        Result: result,
        BlackElo,
        WhiteElo,
        EndDate: gameEndDate,
        TimeControl,
        Termination,
        Result,
      } = headers

      const isWhite = whitePlayer.toLowerCase() === playusername.toLowerCase()

      // Parse result
      let gameResult: 'win' | 'loss' | 'draw'
      if (result === '1-0') {
        gameResult = isWhite ? 'win' : 'loss'
      } else if (result === '0-1') {
        gameResult = isWhite ? 'loss' : 'win'
      } else {
        gameResult = 'draw'
      }
      standardgamesData.push({
        date_time: formatDate(game.end_time),
        gameEndDate,
        Result,
        resultForPlayer: gameResult,
        whitePlayer,
        blackPlayer,
        BlackElo,
        WhiteElo,
        TimeControl,
        Termination,
        moveCount: Math.round(chess.history().length / 2),
        // pgn: game.pgn,
        PlayerELO: isWhite ? WhiteElo : BlackElo,
        url: game.url,
        time_class: game.time_class,
      })
    }
  })

  return { standardgamesData, chess960Games }
}
