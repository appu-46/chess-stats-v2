/// <reference types="node" />
// GET /api/player-summary?platform=chess.com&username=hikaru
//
// The short write-up above a profile's peak ratings. Fetches the player's
// newest games and ratings itself, works out the facts
// (src/helpers/calculatePlayerFacts.ts), and has Gemini turn only those
// facts into a few sentences. The facts are computed here rather than sent
// by the browser, so nobody can put made-up numbers into a real player's
// summary or use the endpoint as a free LLM. Netlify's CDN keeps each
// answer for a day, so a player costs at most one Gemini call per day.
import {
  calculatePlayerFacts,
  ratingsFromStats,
} from '../../src/helpers/calculatePlayerFacts'
import { normalizeChessComStats } from '../../src/helpers/normalizePlayer'
import {
  transformChessComGame,
  transformLichessGame,
} from '../../src/helpers/transformGame'
import type {
  PlayerFacts,
  TimeClassRating,
} from '../../src/helpers/calculatePlayerFacts'
import type {
  ChessComGame,
  LichessGame,
  TransformedGame,
} from '../../src/helpers/transformGame'

export const config = { path: '/api/player-summary' }

// Tried in order: the free tier often turns 3.6 away as "high demand",
// and the previous Flash usually has room then.
const MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash']
const geminiUrl = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

// Lichess streams exports at ~20 games/sec, so this keeps the slowest
// request to a few seconds.
const MAX_GAMES = 100
const FETCH_TIMEOUT_MS = 8000
const GEMINI_TIMEOUT_MS = 8000

// chess.com refuses requests without a User-Agent, and asks API users to
// identify themselves.
const HEADERS = { 'User-Agent': 'ChessStats player summaries (Netlify)' }

// Mirrors src/helpers/timeControls.ts, which can't be imported here
// without pulling in its React icons.
const TIME_CLASSES = {
  'chess.com': ['blitz', 'rapid', 'bullet', 'daily'],
  lichess: ['blitz', 'rapid', 'bullet', 'classical', 'correspondence'],
} as const
type Platform = keyof typeof TIME_CLASSES

// Both platforms' usernames: letters, digits, _ and -.
const USERNAME = /^[A-Za-z0-9_-]{2,30}$/

const SYSTEM_PROMPT = `You write the short summary shown at the top of a chess player's profile on a free stats site.

Rules:
- Use ONLY the facts in the JSON you are given. Never add anything that isn't there: no playing style ("aggressive", "tactical", "positional", "endgame specialist"), no comparisons to famous players, no guesses about the person.
- 2 or 3 sentences, at most 60 words, in the third person, calling the player by their username exactly as written (with their title in front if they have one).
- The facts cover the player's last gamesAnalyzed games; call them "their last N games" or "recent games". "peak" is the highest rating they have ever reached, not their current one.
- Pick the 3 or 4 most interesting facts rather than listing everything. A big rating change, a long streak, a clear color or opening preference, or how they bounce back after losses are good picks.
- scorePctAsWhite/scorePctAsBlack are scores, where a draw counts as half a win: write "scores 83% as White", never "wins 83%" or "win rate".
- Round percentages to whole numbers. Write time controls as Blitz, Rapid, Bullet, Daily, Classical or Correspondence.
- Plain, friendly, factual. No emoji, no exclamation marks, no praise or hype words ("impressive", "exceptional", "incredible", "remarkable", "dominant", "strong").`

// Sent to the browser with every failure, so the console (and the
// Network tab) says what went wrong without exposing anything internal.
type Reason =
  | 'bad_request'
  | 'not_configured'
  | 'player_not_found'
  | 'platform_error'
  | 'gemini_busy'
  | 'gemini_quota'
  | 'gemini_error'
  | 'internal'

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly reason: Reason,
    message: string,
  ) {
    super(message)
  }
}

// One line per step, all tagged, so `netlify dev`'s terminal and the Netlify
// dashboard's function logs can be filtered to just this function.
function log(who: string, message: string) {
  console.log(`[player-summary] ${who}: ${message}`)
}

async function get(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { ...HEADERS, ...init?.headers },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (response.status === 404) {
    throw new HttpError(404, 'player_not_found', `404 from ${url}`)
  }
  if (!response.ok) {
    throw new HttpError(502, 'platform_error', `${response.status} from ${url}`)
  }
  return response
}

interface Player {
  username: string
  title: string | null
  games: Array<TransformedGame>
  ratings: Array<TimeClassRating>
}

async function fetchChessCom(username: string): Promise<Player> {
  const base = `https://api.chess.com/pub/player/${username}`
  const [profile, stats, archives] = await Promise.all([
    get(base).then((r) => r.json()),
    get(`${base}/stats`).then((r) => r.json()),
    get(`${base}/games/archives`).then((r) => r.json()),
  ])

  // The archive list only holds months with games, so the newest two
  // cover the latest games even for someone who hasn't played lately.
  const months: Array<{ games?: Array<ChessComGame> }> = await Promise.all(
    (archives.archives as Array<string>)
      .slice(-2)
      .map((url) => get(url).then((r) => r.json())),
  )
  const lower = username.toLowerCase()
  const games = months
    .flatMap((month) => month.games ?? [])
    .filter((game) => !game.rules || game.rules === 'chess')
    .slice(-MAX_GAMES)
    .map((game) => transformChessComGame(game, lower))
    .filter((game): game is TransformedGame => game !== null)

  return {
    // The API's username is lowercase; the profile URL keeps the
    // player's own capitalization (".../member/Hikaru").
    username:
      String(profile.url ?? '')
        .split('/')
        .pop() || username,
    title: profile.title ?? null,
    games,
    ratings: ratingsFromStats(normalizeChessComStats(stats), [
      ...TIME_CLASSES['chess.com'],
    ]),
  }
}

async function fetchLichess(username: string): Promise<Player> {
  const params = new URLSearchParams({
    max: String(MAX_GAMES),
    perfType: TIME_CLASSES.lichess.join(','),
    opening: 'true',
    moves: 'true',
    finished: 'true',
  })
  const [user, gamesText] = await Promise.all([
    get(`https://lichess.org/api/user/${username}`).then((r) => r.json()),
    get(`https://lichess.org/api/games/user/${username}?${params}`, {
      headers: { Accept: 'application/x-ndjson' },
    }).then((r) => r.text()),
  ])
  if (user.disabled) {
    throw new HttpError(404, 'player_not_found', 'Lichess account closed')
  }

  const lower = username.toLowerCase()
  const games = gamesText
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => transformLichessGame(JSON.parse(line) as LichessGame, lower))
    .filter((game): game is TransformedGame => game !== null)

  const ratings: Array<TimeClassRating> = []
  for (const timeClass of TIME_CLASSES.lichess) {
    const perf = user.perfs?.[timeClass]
    if (!perf?.games) continue
    // The user record has no peak; that needs one request per time class.
    ratings.push({
      timeClass,
      current: perf.rating,
      peak: null,
      games: perf.games,
    })
  }

  return {
    username: user.username ?? username,
    title: user.title ?? null,
    games,
    ratings,
  }
}

const round = (value: number) => Math.round(value)

function notResignation(method: PlayerFacts['topWinMethod']) {
  return method && method.category !== 'Resignation'
    ? { how: method.category, pct: round(method.pct) }
    : null
}

// The facts as Gemini sees them: rounded, and with "notable" decided here
// rather than left to the model.
function promptFacts(player: Player, facts: PlayerFacts, platform: Platform) {
  const { white, black } = facts.scoreByColor
  return {
    username: player.username,
    title: player.title,
    site: platform === 'lichess' ? 'Lichess' : 'Chess.com',
    gamesAnalyzed: facts.gamesAnalyzed,
    mostPlayed: facts.mainTimeClass && {
      timeClass: facts.mainTimeClass.timeClass,
      sharePct: round(facts.mainTimeClass.sharePct),
    },
    currentRatings: facts.ratings.map((r) => ({
      timeClass: r.timeClass,
      rating: r.current,
      peak: r.peak,
      lifetimeGames: r.games,
    })),
    strongestTimeClass: facts.strongestTimeClass,
    ratingChangeOverPeriod: facts.ratingChange,
    scorePctAsWhite: white.games >= 10 ? round(white.scorePct) : null,
    scorePctAsBlack: black.games >= 10 ? round(black.scorePct) : null,
    // Most games end by resignation, so that says nothing about anyone.
    mostWinsEndBy: notResignation(facts.topWinMethod),
    mostLossesEndBy: notResignation(facts.topLossMethod),
    longestWinStreak: facts.longestWinStreak,
    currentStreak: facts.currentStreak.count >= 3 ? facts.currentStreak : null,
    winPctAfterAWin: round(facts.winRateAfterWin),
    winPctAfterALoss: round(facts.winRateAfterLoss),
    favoriteOpeningAsWhite: facts.favoriteOpenings.white,
    favoriteOpeningAsBlack: facts.favoriteOpenings.black,
    averageMovesPerGame: facts.averageMoves,
  }
}

async function callGemini(
  apiKey: string,
  facts: object,
  who: string,
): Promise<string> {
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(facts) }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: { summary: { type: 'STRING' } },
        required: ['summary'],
      },
      thinkingConfig: { thinkingLevel: 'low' },
    },
  })

  // Whether any model was out of quota rather than just busy: the free
  // tier allows only 20 requests a day per model.
  let quotaHit = false
  for (const model of MODELS) {
    const started = Date.now()
    let response: Response
    try {
      response = await fetch(geminiUrl(model), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body,
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      })
    } catch (error) {
      log(who, `${model} gave no answer in ${GEMINI_TIMEOUT_MS}ms (${error})`)
      continue
    }
    const took = `${Date.now() - started}ms`
    // Busy (503) or out of free quota (429): try the next model.
    if (response.status === 503 || response.status === 429) {
      quotaHit ||= response.status === 429
      log(
        who,
        `${model} ${response.status === 429 ? 'is out of quota (429)' : 'is busy (503)'} after ${took}, trying next`,
      )
      continue
    }
    if (!response.ok) {
      // Gemini's error body names the problem (bad key, bad request...)
      // and never echoes the key, so it's safe to log.
      const detail = (await response.text()).slice(0, 300)
      throw new HttpError(
        502,
        'gemini_error',
        `${model} answered ${response.status} in ${took}: ${detail}`,
      )
    }

    const data = await response.json()
    const candidate = data.candidates?.[0]
    const text: string | undefined = candidate?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? '')
      .join('')
    if (candidate?.finishReason !== 'STOP' || !text) {
      throw new HttpError(
        502,
        'gemini_error',
        `${model} finished with ${candidate?.finishReason} in ${took}`,
      )
    }
    const summary = JSON.parse(text).summary
    if (
      typeof summary !== 'string' ||
      summary.length < 20 ||
      summary.length > 600
    ) {
      throw new HttpError(
        502,
        'gemini_error',
        `${model} returned an unusable summary: ${text.slice(0, 200)}`,
      )
    }
    const tokens = data.usageMetadata?.totalTokenCount ?? '?'
    log(who, `${model} wrote the summary in ${took} (${tokens} tokens)`)
    return summary.trim()
  }
  throw quotaHit
    ? new HttpError(
        503,
        'gemini_quota',
        'Out of free Gemini quota; it resets daily (see https://ai.dev/rate-limit)',
      )
    : new HttpError(503, 'gemini_busy', 'Every Gemini model was busy')
}

function json(status: number, body: object, cache: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Browsers recheck hourly; Netlify's CDN keeps a summary for a day,
      // shared across its edge locations.
      'Cache-Control': cache,
      'Netlify-CDN-Cache-Control':
        status === 200 ? 'public, durable, s-maxage=86400' : 'no-store',
    },
  })
}

export default async function handler(request: Request) {
  const started = Date.now()
  const url = new URL(request.url)
  const platform = url.searchParams.get('platform') ?? 'chess.com'
  const username = url.searchParams.get('username') ?? ''
  const who = `${platform}/${username}`

  if (!(platform in TIME_CLASSES) || !USERNAME.test(username)) {
    log(who, 'rejected: bad platform or username')
    return json(400, { reason: 'bad_request' }, 'no-store')
  }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    log(who, 'GEMINI_API_KEY is not set (.env locally, Netlify env vars live)')
    return json(503, { reason: 'not_configured' }, 'no-store')
  }

  try {
    const player =
      platform === 'lichess'
        ? await fetchLichess(username)
        : await fetchChessCom(username)
    log(
      who,
      `fetched ${player.games.length} games in ${Date.now() - started}ms`,
    )
    const facts = calculatePlayerFacts(
      player.games,
      player.ratings,
      player.username,
    )
    // Too few recent games to say anything true: no summary at all.
    if (!facts) {
      log(who, 'too few games for a summary')
      return json(200, { summary: null }, 'public, max-age=3600')
    }

    const summary = await callGemini(
      apiKey,
      promptFacts(player, facts, platform as Platform),
      who,
    )
    log(who, `done in ${Date.now() - started}ms`)
    return json(
      200,
      { summary, gamesAnalyzed: facts.gamesAnalyzed },
      'public, max-age=3600',
    )
  } catch (error) {
    const failure =
      error instanceof HttpError
        ? error
        : new HttpError(500, 'internal', String(error))
    console.error(
      `[player-summary] ${who}: FAILED (${failure.reason}) after ${Date.now() - started}ms: ${failure.message}`,
    )
    return json(failure.status, { reason: failure.reason }, 'no-store')
  }
}
