// Netlify Edge Function (Deno): gives link-preview bots a page-specific
// title and description. See ../lib/preview.ts. People's browsers get the page
// untouched, and any failure falls back to the page as it is.
import {
  comparePreview,
  injectPreview,
  isPreviewBot,
  leaderboardPreview,
  playerPreview,
} from '../lib/preview.ts'
import type { PlayerSummary, Preview } from '../lib/preview.ts'

type Context = { next: () => Promise<Response> }

// chess.com refuses requests without a User-Agent, and asks API users to
// identify themselves.
const HEADERS = { 'User-Agent': 'ChessStats link previews (Netlify)' }
const TIMEOUT_MS = 2500

const RATING_ORDER = ['blitz', 'rapid', 'bullet', 'daily', 'classical']

async function getJson(url: string) {
  const response = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.json()
}

async function chessComPlayer(username: string): Promise<PlayerSummary> {
  const base = `https://api.chess.com/pub/player/${encodeURIComponent(username)}`
  const [profile, stats] = await Promise.all([
    getJson(base),
    // Fails for some accounts; the preview just goes without ratings.
    getJson(`${base}/stats`).catch(() => ({})),
  ])
  const ratings: Array<[string, number]> = []
  for (const tc of RATING_ORDER) {
    const rating = stats[`chess_${tc}`]?.last?.rating
    if (typeof rating === 'number') ratings.push([tc, rating])
  }
  return {
    username: profile.username ?? username,
    name: profile.name ?? null,
    title: profile.title ?? null,
    platform: 'chess.com',
    ratings,
  }
}

async function lichessPlayer(username: string): Promise<PlayerSummary> {
  const user = await getJson(
    `https://lichess.org/api/user/${encodeURIComponent(username)}`,
  )
  const ratings: Array<[string, number]> = []
  for (const tc of RATING_ORDER) {
    const perf = user.perfs?.[tc]
    if (perf?.games) ratings.push([tc, perf.rating])
  }
  const p = user.profile ?? {}
  const name =
    p.realName || [p.firstName, p.lastName].filter(Boolean).join(' ') || null
  return {
    username: user.username ?? username,
    name,
    title: user.title ?? null,
    platform: 'lichess',
    ratings,
  }
}

async function previewFor(url: URL): Promise<Preview | null> {
  const [, section, param] = url.pathname.split('/')
  const search = url.searchParams

  if (section === 'compare') {
    const a = search.get('a')
    const b = search.get('b')
    return a && b ? comparePreview(a, b) : null
  }
  if (section === 'leaderboard') return leaderboardPreview(search)
  if (!param) return null

  const username = decodeURIComponent(param)
  const player =
    search.get('platform') === 'lichess'
      ? await lichessPlayer(username)
      : await chessComPlayer(username)
  return playerPreview(section, player)
}

export default async function linkPreview(request: Request, context: Context) {
  const response = await context.next()
  if (!isPreviewBot(request.headers.get('user-agent'))) return response
  if (!response.headers.get('content-type')?.includes('text/html')) {
    return response
  }

  try {
    const url = new URL(request.url)
    const preview = await previewFor(url)
    if (!preview) return response
    const html = injectPreview(await response.text(), preview, url.href)
    const headers = new Headers(response.headers)
    headers.delete('content-length')
    return new Response(html, { status: response.status, headers })
  } catch (error) {
    console.error(error)
    return response
  }
}

export const config = {
  path: [
    '/profile/*',
    '/stats/*',
    '/dashboard/*',
    '/games/*',
    '/compare',
    '/leaderboard',
  ],
}
