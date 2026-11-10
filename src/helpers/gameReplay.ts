// Turns a game's moves into the list of positions the game viewer steps
// through. Takes either a full PGN (chess.com, clock comments included)
// or a bare move list (lichess).
import { Chess } from 'chess.js'

export interface ReplayMove {
  san: string
  from: string
  to: string
  // The position after this move.
  fen: string
  color: 'w' | 'b'
  // "0:02:57.9" as the site wrote it, when the PGN has clock comments.
  clock: string | null
}

export interface Replay {
  startFen: string
  moves: Array<ReplayMove>
  // What the rules say about the final position, for games whose site
  // only reports "drawn" without the reason.
  finalPosition: {
    checkmate: boolean
    stalemate: boolean
    insufficientMaterial: boolean
    repetition: boolean
    fiftyMoves: boolean
  }
}

const CLOCK_RE = /\[%clk\s+([\d:.]+)\]/g

// Throws when the moves can't be read (an empty game, or one chess.js
// doesn't accept); the viewer then offers the link to the site instead.
export function buildReplay(pgnOrMoves: string): Replay {
  const chess = new Chess()
  chess.loadPgn(pgnOrMoves)
  const history = chess.history({ verbose: true })
  if (history.length === 0) throw new Error('This game has no moves.')

  // One clock comment per move, in order. If the counts differ (some
  // moves uncommented) they can't be matched up, so none are shown.
  const clocks = [...pgnOrMoves.matchAll(CLOCK_RE)].map((match) => match[1])
  const hasClocks = clocks.length === history.length

  return {
    startFen: history[0].before,
    moves: history.map((move, index) => ({
      san: move.san,
      from: move.from,
      to: move.to,
      fen: move.after,
      color: move.color,
      clock: hasClocks ? clocks[index] : null,
    })),
    finalPosition: {
      checkmate: chess.isCheckmate(),
      stalemate: chess.isStalemate(),
      insufficientMaterial: chess.isInsufficientMaterial(),
      repetition: chess.isThreefoldRepetition(),
      fiftyMoves: chess.isDrawByFiftyMoves(),
    },
  }
}

// "0:02:57.9" -> "2:57", "1:05:00" -> "1:05:00". Tenths only matter in
// the last seconds, where they're kept: "0:00:07.3" -> "0:07.3".
export function formatClock(clock: string): string {
  const [hours = '0', minutes = '0', seconds = '0'] = clock.split(':')
  const whole = seconds.split('.')[0].padStart(2, '0')
  if (Number(hours) > 0) return `${Number(hours)}:${minutes}:${whole}`
  if (Number(minutes) === 0 && Number(whole) < 10 && seconds.includes('.'))
    return `0:${seconds.padStart(4, '0')}`
  return `${Number(minutes)}:${whole}`
}

// Each side's clock once `ply` moves have been played (0 = the start).
export function clocksAt(
  moves: Array<ReplayMove>,
  ply: number,
): { white: string | null; black: string | null } {
  let white: string | null = null
  let black: string | null = null
  for (let i = 0; i < ply && i < moves.length; i++) {
    if (moves[i].color === 'w') white = moves[i].clock
    else black = moves[i].clock
  }
  return { white, black }
}

// ── How the game ended ────────────────────────────────────────────────

export type EndReason =
  | 'checkmate'
  | 'resignation'
  | 'timeout'
  | 'abandonment'
  | 'stalemate'
  | 'repetition'
  | 'insufficientMaterial'
  | 'fiftyMoves'
  | 'agreement'
  // Out of time, but the opponent couldn't have mated: a draw.
  | 'timeoutVsInsufficient'
  | 'other'

export interface GameEnding {
  // null for a draw.
  winner: 'white' | 'black' | null
  reason: EndReason
}

export const END_REASON_LABELS: Record<EndReason, string> = {
  checkmate: 'Checkmate',
  resignation: 'Resignation',
  timeout: 'Out of time',
  abandonment: 'Abandoned',
  stalemate: 'Stalemate',
  repetition: 'Threefold repetition',
  insufficientMaterial: 'Insufficient material',
  fiftyMoves: '50-move rule',
  agreement: 'Draw agreed',
  timeoutVsInsufficient: 'Timeout vs insufficient material',
  other: 'Game over',
}

// Reads the result ("1-0") and the site's sentence about the ending
// ("Hikaru won on time", "Game drawn by repetition"). Where the sentence
// doesn't say why (lichess's draws are all "Game drawn"), the final
// position does, when the rules settle it.
export function gameEnding(
  result: string,
  termination: string,
  finalPosition?: Replay['finalPosition'],
): GameEnding {
  const winner = result === '1-0' ? 'white' : result === '0-1' ? 'black' : null
  const text = termination.toLowerCase()

  if (winner) {
    const reason: EndReason = text.includes('checkmate')
      ? 'checkmate'
      : text.includes('resign')
        ? 'resignation'
        : text.includes('abandon')
          ? 'abandonment'
          : text.includes('time')
            ? 'timeout'
            : finalPosition?.checkmate
              ? 'checkmate'
              : 'other'
    return { winner, reason }
  }

  const reason: EndReason = text.includes('stalemate')
    ? 'stalemate'
    : text.includes('timeout') || text.includes('on time')
      ? 'timeoutVsInsufficient'
      : text.includes('repetition')
        ? 'repetition'
        : text.includes('insufficient')
          ? 'insufficientMaterial'
          : text.includes('50-move') || text.includes('fifty')
            ? 'fiftyMoves'
            : text.includes('agreement')
              ? 'agreement'
              : finalPosition?.stalemate
                ? 'stalemate'
                : finalPosition?.insufficientMaterial
                  ? 'insufficientMaterial'
                  : finalPosition?.repetition
                    ? 'repetition'
                    : finalPosition?.fiftyMoves
                      ? 'fiftyMoves'
                      : 'agreement'
  return { winner: null, reason }
}

// Where each king stands in a position, e.g. { white: 'g1', black: 'e8' }.
export function kingSquares(fen: string): { white: string; black: string } {
  const squares = { white: '', black: '' }
  const ranks = fen.split(' ')[0].split('/')
  ranks.forEach((rank, rankIndex) => {
    let file = 0
    for (const char of rank) {
      if (/\d/.test(char)) {
        file += Number(char)
        continue
      }
      const square = `${'abcdefgh'[file]}${8 - rankIndex}`
      if (char === 'K') squares.white = square
      if (char === 'k') squares.black = square
      file++
    }
  })
  return squares
}
