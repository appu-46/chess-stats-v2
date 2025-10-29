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

type GameResponse = { games: Array<Game> }

type TransformedGame = {
  BlackElo: string
  PlayerELO: string
  Result: string
  TimeControl: string
  WhiteElo: string
  blackPlayer: string
  date_time: string
  gameEndDate: string
  moveCount: number
  resultForPlayer: 'win' | 'loss' | 'draw'
  time_class: string
  url: string
  whitePlayer: string
  Termination: string
}

type Chess960Game = {
  date: string
  result: string
  whitePlayer: string
  blackPlayer: string
  pgn: string
  url: string
}

export function transformGames(input: GameResponse | null, username: string) {
  if (!input?.games.length) return { standardgamesData: [], chess960Games: [] }

  const lowerUsername = username.toLowerCase()

  // Separate games by type first
  const { chess960, standard } = input.games.reduce(
    (acc, game) => {
      game.rules === 'chess960'
        ? acc.chess960.push(game)
        : acc.standard.push(game)
      return acc
    },
    { chess960: [] as Array<Game>, standard: [] as Array<Game> },
  )

  // Process chess960 games (no Chess.js needed)
  const chess960Games: Array<Chess960Game> = chess960.map((game) => ({
    date: formatDate(game.end_time).formattedDateTime,
    result: game.result,
    whitePlayer: game.white.username,
    blackPlayer: game.black.username,
    pgn: game.pgn,
    url: game.url,
  }))
  const blitzGames: Array<TransformedGame> = []
  const rapidGames: Array<TransformedGame> = []
  const dailyGames: Array<TransformedGame> = []
  const bulletGames: Array<TransformedGame> = []
  // Process standard games
  const chess = new Chess()
  const standardgamesData: Array<TransformedGame> = standard.map((game) => {
    const formattedDate = formatDate(game.end_time).formattedDateTime
    chess.loadPgn(game.pgn)
    const headers = chess.getHeaders()

    const isWhite = headers.White.toLowerCase() === lowerUsername

    // Fixed: Proper result calculation with correct fallback
    let gameResult: 'win' | 'loss' | 'draw'
    if (headers.Result === '1-0') {
      gameResult = isWhite ? 'win' : 'loss'
    } else if (headers.Result === '0-1') {
      gameResult = isWhite ? 'loss' : 'win'
    } else {
      gameResult = 'draw'
    }

    const result = {
      date_time: formattedDate,
      gameEndDate: headers.EndDate,
      Result: headers.Result,
      resultForPlayer: gameResult,
      whitePlayer: headers.White,
      blackPlayer: headers.Black,
      BlackElo: headers.BlackElo,
      WhiteElo: headers.WhiteElo,
      TimeControl: headers.TimeControl,
      Termination: headers.Termination,
      moveCount: Math.round(chess.history().length / 2),
      PlayerELO: isWhite ? headers.WhiteElo : headers.BlackElo,
      url: game.url,
      time_class: game.time_class,
    }

    chess.reset()
    if (game.time_class === 'blitz') blitzGames.push(result)
    if (game.time_class === 'rapid') rapidGames.push(result)
    if (game.time_class === 'bullet') bulletGames.push(result)
    if (game.time_class === 'daily') dailyGames.push(result)

    return result
  })

  return {
    standardgamesData,
    chess960Games,
    blitzGames,
    rapidGames,
    bulletGames,
    dailyGames,
  }
}
