import dayjs from 'dayjs'
import { formatDate } from './DateFormat'
import { parsePgnLite } from './PgnParseLite'
import { openingFamily, parseChessComOpening } from './openings'

// ── Raw platform shapes ─────────────────────────────────────────────

export type ChessComGame = {
  url: string
  time_control: string
  black: { username: string; result: string }
  white: { username: string; result: string }
  pgn: string
  end_time: number
  time_class: string
  result?: string
  rules?: string
  fen: string
}

type LichessGamePlayer = {
  user?: { name: string; id: string; title?: string }
  rating?: number
  ratingDiff?: number
  aiLevel?: number
}

export type LichessGame = {
  id: string
  rated: boolean
  variant: string
  speed: string
  perf: string
  createdAt: number
  lastMoveAt: number
  status: string
  players: { white: LichessGamePlayer; black: LichessGamePlayer }
  winner?: 'white' | 'black'
  opening?: { eco: string; name: string; ply: number }
  moves?: string
  clock?: { initial: number; increment: number; totalTime: number }
  daysPerTurn?: number
}

// ── Normalized shape every dashboard/games view consumes ────────────

export type GameResult = 'win' | 'loss' | 'draw'

export type TransformedGame = {
  BlackElo: string
  PlayerELO: string
  Result: string
  TimeControl: string
  WhiteElo: string
  blackPlayer: string
  date_time: string
  // YYYY.MM.DD - the grouping key for per-day graphs.
  gameEndDate: string
  // Unix seconds; lets callers order games without re-parsing date strings.
  endTime: number
  moveCount: number
  resultForPlayer: GameResult
  time_class: string
  url: string
  whitePlayer: string
  Termination: string
  opening: string | null
  openingFamily: string | null
  eco: string | null
}

function resultFor(isWhite: boolean, result: string): GameResult {
  if (result === '1-0') return isWhite ? 'win' : 'loss'
  if (result === '0-1') return isWhite ? 'loss' : 'win'
  return 'draw'
}

// ── chess.com ───────────────────────────────────────────────────────

// The same few hundred ECOUrls repeat across thousands of games, so each is
// parsed once. Without this, opening parsing added ~25% to the transform.
const chessComOpeningCache = new Map<
  string,
  { opening: string | null; family: string | null }
>()

function chessComOpening(ecoUrl: string | undefined) {
  if (!ecoUrl) return { opening: null, family: null }
  let parsed = chessComOpeningCache.get(ecoUrl)
  if (!parsed) {
    const opening = parseChessComOpening(ecoUrl)
    parsed = { opening, family: openingFamily(opening) }
    chessComOpeningCache.set(ecoUrl, parsed)
  }
  return parsed
}

// Returns null for malformed entries the way the old try/catch around
// loadPgn used to - no legality check, but catches the realistic failure
// mode of an empty/garbage movetext.
export function transformChessComGame(
  game: ChessComGame,
  lowerUsername: string,
): TransformedGame | null {
  const { headers, moveCount, isValid } = parsePgnLite(game.pgn)
  if (!isValid || !headers.White || !headers.Black) return null

  const isWhite = headers.White.toLowerCase() === lowerUsername
  const { opening, family } = chessComOpening(headers.ECOUrl)

  return {
    date_time: formatDate(game.end_time).formattedDateTime,
    gameEndDate: headers.EndDate,
    endTime: game.end_time,
    Result: headers.Result,
    resultForPlayer: resultFor(isWhite, headers.Result),
    whitePlayer: headers.White,
    blackPlayer: headers.Black,
    BlackElo: headers.BlackElo,
    WhiteElo: headers.WhiteElo,
    TimeControl: headers.TimeControl,
    Termination: headers.Termination,
    moveCount,
    PlayerELO: isWhite ? headers.WhiteElo : headers.BlackElo,
    url: game.url,
    time_class: game.time_class,
    opening,
    openingFamily: family,
    eco: headers.ECO || null,
  }
}

// ── lichess ─────────────────────────────────────────────────────────

// Statuses that never produced a result - nothing to analyze.
const UNFINISHED_STATUSES = new Set(['created', 'started', 'aborted'])

function lichessPlayerName(player: LichessGamePlayer): string {
  if (player.user) return player.user.name
  if (player.aiLevel) return `Stockfish level ${player.aiLevel}`
  return 'Anonymous'
}

// Lichess reports a terse status enum; this rewrites it into the same
// sentence style chess.com puts in its Termination header, so
// categorizeTermination works unchanged for both platforms.
export function lichessTermination(
  status: string,
  winnerName: string | null,
): string {
  const won = (how: string) => `${winnerName} won ${how}`
  switch (status) {
    case 'mate':
      return won('by checkmate')
    case 'resign':
      return won('by resignation')
    case 'outoftime':
      return winnerName
        ? won('on time')
        : 'Game drawn by timeout vs insufficient material'
    case 'timeout':
    case 'noStart':
      return winnerName ? won('by abandonment') : 'Game drawn'
    case 'stalemate':
      return 'Game drawn by stalemate'
    case 'insufficientMaterialClaim':
      return 'Game drawn by insufficient material'
    case 'cheat':
      return won('- opponent disqualified')
    case 'variantEnd':
      return won('by variant rule')
    default:
      return winnerName ? `${winnerName} won` : 'Game drawn'
  }
}

export function transformLichessGame(
  game: LichessGame,
  lowerUsername: string,
): TransformedGame | null {
  if (UNFINISHED_STATUSES.has(game.status)) return null
  if (game.variant !== 'standard') return null

  const { white, black } = game.players
  const whiteName = lichessPlayerName(white)
  const blackName = lichessPlayerName(black)
  const isWhite =
    white.user?.id === lowerUsername ||
    whiteName.toLowerCase() === lowerUsername

  const Result =
    game.winner === 'white'
      ? '1-0'
      : game.winner === 'black'
        ? '0-1'
        : '1/2-1/2'
  const winnerName =
    game.winner === 'white'
      ? whiteName
      : game.winner === 'black'
        ? blackName
        : null

  const plies = game.moves ? game.moves.split(' ').filter(Boolean).length : 0
  const endTime = Math.floor(game.lastMoveAt / 1000)
  const whiteElo = white.rating != null ? String(white.rating) : ''
  const blackElo = black.rating != null ? String(black.rating) : ''
  const opening = game.opening?.name ?? null

  return {
    date_time: formatDate(endTime).formattedDateTime,
    gameEndDate: dayjs(game.lastMoveAt).format('YYYY.MM.DD'),
    endTime,
    Result,
    resultForPlayer: resultFor(isWhite, Result),
    whitePlayer: whiteName,
    blackPlayer: blackName,
    WhiteElo: whiteElo,
    BlackElo: blackElo,
    TimeControl: game.clock
      ? `${game.clock.initial}+${game.clock.increment}`
      : game.daysPerTurn
        ? `${game.daysPerTurn}d`
        : '-',
    Termination: lichessTermination(game.status, winnerName),
    moveCount: Math.ceil(plies / 2),
    PlayerELO: isWhite ? whiteElo : blackElo,
    url: `https://lichess.org/${game.id}${isWhite ? '' : '/black'}`,
    time_class: game.speed,
    opening,
    openingFamily: openingFamily(opening),
    eco: game.opening?.eco ?? null,
  }
}
