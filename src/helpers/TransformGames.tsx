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
  fen: string
}

type GameResponse = Array<Game>

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

// ─── PGN parsing helpers ────────────────────────────────────────────────────
// Chess.com PGNs are a fixed header block, a blank line, then movetext.
// Headers and move count can both be read straight off that text, so there's
// no need to load the game into a chess engine just to read metadata.

const HEADER_REGEX = /\[(\w+)\s+"([^"]*)"\]/g
const CLOCK_COMMENT_REGEX = /\{[^}]*\}/g
const MOVE_NUMBER_REGEX = /\d+\.(\.\.)?/g
const RESULT_TOKEN_REGEX = /1-0|0-1|1\/2-1\/2|\*/g

function parseHeaders(pgn: string): Record<string, string> {
  const headers: Record<string, string> = {}
  const headerEnd = pgn.indexOf('\n\n')
  const headerSection = headerEnd === -1 ? pgn : pgn.slice(0, headerEnd)

  HEADER_REGEX.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = HEADER_REGEX.exec(headerSection)) !== null) {
    headers[match[1]] = match[2]
  }
  return headers
}

function countMoves(pgn: string): number {
  const headerEnd = pgn.indexOf('\n\n')
  const movetext = headerEnd === -1 ? pgn : pgn.slice(headerEnd + 2)

  const cleaned = movetext
    .replace(CLOCK_COMMENT_REGEX, '')
    .replace(MOVE_NUMBER_REGEX, '')
    .replace(RESULT_TOKEN_REGEX, '')
    .trim()

  if (!cleaned) return 0
  const plies = cleaned.split(/\s+/).filter(Boolean)
  return Math.round(plies.length / 2)
}

// ─── Main transform ─────────────────────────────────────────────────────────

export function transformGames(input: GameResponse | null, username: string) {
  if (!input?.length)
    return {
      standardgamesData: [],
      chess960Games: [],
      blitzGames: [],
      rapidGames: [],
      bulletGames: [],
      dailyGames: [],
    }

  const lowerUsername = username.toLowerCase()

  // Separate games by type first
  const { chess960, standard } = input.reduce(
    (acc, game) => {
      if (game.rules === 'chess960') acc.chess960.push(game)
      else if (!game.rules || game.rules === 'chess') acc.standard.push(game)
      return acc
    },
    { chess960: [] as Array<Game>, standard: [] as Array<Game> },
  )

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
  const standardgamesData: Array<TransformedGame> = []

  // Process standard games
  for (const game of standard) {
    try {
      const formattedDate = formatDate(game.end_time).formattedDateTime
      const headers = parseHeaders(game.pgn)

      // Headers should always be present in a valid chess.com PGN.
      // If they're missing, treat it like the old loadPgn() failure case.
      if (!headers.White || !headers.Black || !headers.Result) {
        throw new Error(`Missing PGN headers for game: ${game.url}`)
      }

      const isWhite = headers.White.toLowerCase() === lowerUsername

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
        moveCount: countMoves(game.pgn),
        PlayerELO: isWhite ? headers.WhiteElo : headers.BlackElo,
        url: game.url,
        time_class: game.time_class,
      }

      // Add to appropriate arrays
      standardgamesData.push(result)
      if (game.time_class === 'blitz') blitzGames.push(result)
      if (game.time_class === 'rapid') rapidGames.push(result)
      if (game.time_class === 'bullet') bulletGames.push(result)
      if (game.time_class === 'daily') dailyGames.push(result)
    } catch (error) {
      console.error(error)
      continue
    }
  }

  return {
    standardgamesData,
    chess960Games,
    blitzGames,
    rapidGames,
    bulletGames,
    dailyGames,
  }
}
