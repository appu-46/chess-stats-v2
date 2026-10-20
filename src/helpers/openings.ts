// Words that close an opening's family name: "Sicilian Defense", "Italian
// Game", "Queens Gambit", "London System"... Everything after is the variation.
const FAMILY_TERMINATORS = new Set([
  'defense',
  'defence',
  'opening',
  'game',
  'gambit',
  'attack',
  'system',
])

const MOVE_TOKEN_RE = /^\d+\./
const GLUED_MOVES_RE = /\.{3}\d.*$/

/**
 * chess.com doesn't put an opening name in its PGNs, only an ECOUrl like
 * https://www.chess.com/openings/Scandinavian-Defense-Mieses-Kotrc-Variation-3.Nf3
 * The slug is the name with spaces as hyphens, optionally followed by the
 * move sequence that reached it, which is dropped. That sequence is either
 * its own hyphen-separated token ("-3.Nf3", "-2...Nc6") or glued straight
 * onto the last word with an ellipsis ("Queens-Pawn-Opening...2.g3-g6").
 */
export function parseChessComOpening(
  ecoUrl: string | undefined,
): string | null {
  if (!ecoUrl) return null
  const slug = ecoUrl.split('?')[0].split('/').filter(Boolean).pop()
  if (!slug || slug === 'openings') return null

  let decoded: string
  try {
    decoded = decodeURIComponent(slug)
  } catch {
    decoded = slug
  }

  const words: Array<string> = []
  for (const token of decoded.replace(GLUED_MOVES_RE, '').split('-')) {
    if (MOVE_TOKEN_RE.test(token)) break
    if (token) words.push(token)
  }
  return words.length ? words.join(' ') : null
}

/**
 * Collapses a full opening name to its family so variations group together.
 * Lichess names carry an explicit "Family: Variation" separator; chess.com
 * slugs don't, so those fall back to cutting at the first family-ending word.
 */
export function openingFamily(name: string | null | undefined): string | null {
  if (!name) return null
  const head = name.split(':')[0].split(',')[0].trim()
  if (!head) return null
  if (name.includes(':')) return head

  const words = head.split(/\s+/)
  const end = words.findIndex((w) => FAMILY_TERMINATORS.has(w.toLowerCase()))
  return end === -1
    ? words.slice(0, 2).join(' ')
    : words.slice(0, end + 1).join(' ')
}
