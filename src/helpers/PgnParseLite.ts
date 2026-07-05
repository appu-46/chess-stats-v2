const HEADER_RE = /\[(\w+)\s+"([^"]*)"\]/g
const COMMENT_RE = /\{[^}]*\}/g
const MOVE_NUM_RE = /(\d+)\.(?:\.\.)?\s/g

export interface PgnHeaders {
  [key: string]: string
}

export interface ParsedPgn {
  headers: PgnHeaders
  moveCount: number
  isValid: boolean
}

/**
 * Parses a single chess.com PGN without touching chess.js.
 * Extracts only what the dashboard needs: headers + move count.
 *
 * Does NOT validate legality - the old chess.loadPgn() + try/catch gave
 * that for free as a side effect. This is deliberately traded away for
 * speed; callers should keep filtering to rules === 'chess' | 'chess960'
 * upstream, and check `isValid` here to catch clearly malformed entries
 * (missing Result header, zero parsed moves) before using the result.
 *
 * Verified against real chess.com PGNs (games ending on both White's and
 * Black's move) to match chess.js's Math.round(history().length / 2)
 * exactly. Re-verify against your own archive before trusting broadly -
 * this hasn't been run against chess960, aborted, or in-progress ("*")
 * games.
 */
export function parsePgnLite(pgn: string): ParsedPgn {
  const headers: PgnHeaders = {}
  for (const match of pgn.matchAll(HEADER_RE)) {
    headers[match[1]] = match[2]
  }

  // Headers and movetext are separated by a blank line. Do NOT split on
  // the last "]" - clock comments like {[%clk 0:03:00]} contain "]"
  // inside the movetext itself, which grabs almost nothing.
  const blankLineIdx = pgn.search(/\n\s*\n/)
  const movetext = blankLineIdx === -1 ? pgn : pgn.slice(blankLineIdx)
  const stripped = movetext.replace(COMMENT_RE, '')

  const moveMatches = [...stripped.matchAll(MOVE_NUM_RE)]
  const moveCount = moveMatches.length
    ? parseInt(moveMatches[moveMatches.length - 1][1], 10)
    : 0

  const isValid = Boolean(headers.Result) && moveCount > 0

  return { headers, moveCount, isValid }
}
