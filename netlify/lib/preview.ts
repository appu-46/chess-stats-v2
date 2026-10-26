// Link previews for player, compare and leaderboard pages. Link-preview
// bots (WhatsApp, X, Discord...) don't run JavaScript, so without this
// every shared link previews as the home page. The edge function
// (edge-functions/link-preview.ts) fetches what a page is about and puts it into
// index.html's title and preview tags with these helpers. Plain
// TypeScript with no imports, so it runs in Netlify's Deno runtime and is
// unit-tested in Vitest alike. It lives outside edge-functions/ because
// Netlify deploys every file in that folder as a function of its own.

export interface Preview {
  title: string
  description: string
}

const SITE = 'Chess Stats'

// Bots that build link previews or index pages. People's browsers never
// match, so their page loads aren't slowed by the lookups below.
const BOT =
  /bot|crawler|spider|facebookexternalhit|whatsapp|telegram|slack|discord|linkedin|embedly|skype|vkshare|pinterest|preview/i

export function isPreviewBot(userAgent: string | null): boolean {
  return !!userAgent && BOT.test(userAgent)
}

const PLATFORM_LABELS: Record<string, string> = {
  'chess.com': 'Chess.com',
  lichess: 'Lichess',
}

const TIME_CONTROL_LABELS: Record<string, string> = {
  blitz: 'Blitz',
  rapid: 'Rapid',
  bullet: 'Bullet',
  daily: 'Daily',
  classical: 'Classical',
}

const SECTION_LABELS: Record<string, string> = {
  profile: 'profile',
  stats: 'stats',
  dashboard: 'rating history and openings',
  games: 'games',
}

export interface PlayerSummary {
  username: string
  name: string | null
  title: string | null
  platform: 'chess.com' | 'lichess'
  // In display order, e.g. [['blitz', 3482], ['rapid', 2838]].
  ratings: Array<[string, number]>
}

export function playerPreview(section: string, player: PlayerSummary): Preview {
  const site = PLATFORM_LABELS[player.platform]
  const who = player.name
    ? `${player.name} (${player.title ? `${player.title} ` : ''}@${player.username})`
    : `${player.title ? `${player.title} ` : ''}${player.username}`
  const ratings = player.ratings
    .slice(0, 3)
    .map(([tc, rating]) => `${TIME_CONTROL_LABELS[tc] ?? tc} ${rating}`)
    .join(' · ')
  return {
    title: `${who} · ${site} ${SECTION_LABELS[section] ?? 'stats'} · ${SITE}`,
    description: `${ratings ? `${ratings} on ${site}. ` : ''}Ratings over time, openings and game history on ${SITE}: free, no sign-up.`,
  }
}

export function comparePreview(a: string, b: string): Preview {
  return {
    title: `${a} vs ${b} · ${SITE}`,
    description: `${a} and ${b} side by side: ratings, records and rating history in every time control.`,
  }
}

export function leaderboardPreview(search: URLSearchParams): Preview {
  const site = PLATFORM_LABELS[search.get('platform') ?? ''] ?? 'Chess.com'
  const tc = search.get('tc')
  const control = tc ? `${TIME_CONTROL_LABELS[tc] ?? tc} ` : ''
  const country = search.get('country')
  const from = country && country !== 'none' ? ` from ${country}` : ''
  return {
    title: `Top ${site} ${control}players${from} · ${SITE}`,
    description: from
      ? `The ${site} ${control.toLowerCase()}players${from} in the top 100, with their ranks, titles and ratings.`
      : `The top 100 ${site} ${control.toLowerCase()}players, by country and title, updated live.`,
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Swaps the title, description and og:url in our own index.html (whose
// tags are known, see index.html).
export function injectPreview(
  html: string,
  preview: Preview,
  url: string,
): string {
  const title = escapeHtml(preview.title)
  const description = escapeHtml(preview.description)
  const setMeta = (source: string, attr: string, key: string, value: string) =>
    source.replace(
      new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`),
      `$1${value}$2`,
    )

  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  out = setMeta(out, 'name', 'description', description)
  out = setMeta(out, 'property', 'og:title', title)
  out = setMeta(out, 'property', 'og:description', description)
  out = setMeta(out, 'property', 'og:url', escapeHtml(url))
  return out
}
