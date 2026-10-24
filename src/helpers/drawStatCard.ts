// Draws a player's shareable stat card: a 1200×630 image (the size social
// sites use for link previews) with their name, ratings in each time
// control and recent form, in the site's dark green look.
import type { TimeControlConfig } from './timeControls'
import type { GameResult } from './transformGame'

export const CARD_WIDTH = 1200
export const CARD_HEIGHT = 630

const PAD = 64
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"

const INK = '#eefaf4'
const MUTED = 'rgba(238, 250, 244, 0.6)'
const MINT = '#6ee7b7'
const RESULT_COLORS: Record<GameResult, string> = {
  win: '#22c55e',
  loss: '#ef4444',
  draw: '#7f9cc9',
}

export interface StatCardData {
  displayName: string
  handle: string | null
  title: string | null
  platformLabel: string
  country: string | null
  // Up to four, in the platform's time-control order.
  ratings: Array<{
    control: TimeControlConfig
    current: number
    peak: number | null
  }>
  // Oldest first.
  form: Array<GameResult>
  site: string
}

// Resolves to null rather than failing: a card without the photo still
// works. crossOrigin keeps the canvas exportable (chess.com's image host
// allows it).
export function loadImage(
  src: string | null,
): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null)
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

function font(weight: number, size: number) {
  return `${weight} ${size}px ${FONT}`
}

function spaced(ctx: CanvasRenderingContext2D, px: number) {
  // Not in every browser yet; plain text is fine without it.
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`
}

// Shortens `text` with an ellipsis until it fits in `maxWidth`.
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let cut = text
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) {
    cut = cut.slice(0, -1)
  }
  return `${cut}…`
}

function sectionLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
) {
  ctx.font = font(700, 17)
  ctx.fillStyle = MUTED
  spaced(ctx, 3)
  ctx.fillText(text.toUpperCase(), x, y)
  spaced(ctx, 0)
}

export function drawStatCard(
  canvas: HTMLCanvasElement,
  data: StatCardData,
  avatar: HTMLImageElement | null,
  logo: HTMLImageElement | null,
) {
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.textBaseline = 'alphabetic'

  // ── Background ──
  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
  bg.addColorStop(0, '#081410')
  bg.addColorStop(0.5, '#0e2119')
  bg.addColorStop(1, '#081410')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  const glow = ctx.createRadialGradient(1050, 40, 0, 1050, 40, 520)
  glow.addColorStop(0, 'rgba(52, 163, 126, 0.28)')
  glow.addColorStop(1, 'rgba(52, 163, 126, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  ctx.strokeStyle = 'rgba(110, 231, 183, 0.22)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(16, 16, CARD_WIDTH - 32, CARD_HEIGHT - 32, 22)
  ctx.stroke()

  // ── Brand, top right ──
  ctx.font = font(700, 26)
  ctx.fillStyle = MINT
  ctx.textAlign = 'right'
  ctx.fillText('Chess Stats', CARD_WIDTH - PAD, 96)
  const brandWidth = ctx.measureText('Chess Stats').width
  ctx.textAlign = 'left'
  if (logo) ctx.drawImage(logo, CARD_WIDTH - PAD - brandWidth - 36, 66, 26, 39)

  // ── Player ──
  const avatarSize = 120
  const cx = PAD + avatarSize / 2
  const cy = PAD + avatarSize / 2
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  if (avatar) {
    ctx.drawImage(avatar, PAD, PAD, avatarSize, avatarSize)
  } else {
    ctx.fillStyle = '#1d4a3a'
    ctx.fillRect(PAD, PAD, avatarSize, avatarSize)
    ctx.fillStyle = INK
    ctx.font = font(700, 52)
    ctx.textAlign = 'center'
    ctx.fillText(data.displayName.charAt(0).toUpperCase(), cx, cy + 18)
    ctx.textAlign = 'left'
  }
  ctx.restore()
  ctx.strokeStyle = 'rgba(110, 231, 183, 0.5)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, avatarSize / 2 + 5, 0, Math.PI * 2)
  ctx.stroke()

  let x = PAD + avatarSize + 32
  const nameY = PAD + 58
  if (data.title) {
    ctx.font = font(800, 24)
    const badgeWidth = ctx.measureText(data.title).width + 22
    ctx.fillStyle = '#7d2828'
    ctx.beginPath()
    ctx.roundRect(x, nameY - 33, badgeWidth, 40, 8)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.fillText(data.title, x + 11, nameY - 4)
    x += badgeWidth + 14
  }
  ctx.font = font(800, 52)
  ctx.fillStyle = INK
  // Clear of the brand in the corner.
  ctx.fillText(fit(ctx, data.displayName, CARD_WIDTH - PAD - 260 - x), x, nameY)

  const subParts = [
    data.handle ? `@${data.handle}` : null,
    data.platformLabel,
    data.country,
  ].filter(Boolean)
  ctx.font = font(500, 26)
  ctx.fillStyle = MUTED
  ctx.fillText(
    fit(ctx, subParts.join('  ·  '), CARD_WIDTH - PAD * 2 - avatarSize - 32),
    PAD + avatarSize + 32,
    nameY + 48,
  )

  // ── Ratings ──
  const ratingsTop = 250
  sectionLabel(ctx, 'Ratings', PAD, ratingsTop)
  const count = data.ratings.length
  const gap = 20
  const cardWidth = count
    ? (CARD_WIDTH - PAD * 2 - gap * (count - 1)) / count
    : 0
  const cardTop = ratingsTop + 22
  const cardHeight = 180

  if (count === 0) {
    ctx.font = font(500, 26)
    ctx.fillStyle = MUTED
    ctx.fillText('No rated games yet', PAD, cardTop + 50)
  }

  data.ratings.forEach(({ control, current, peak }, i) => {
    const left = PAD + i * (cardWidth + gap)

    ctx.save()
    ctx.beginPath()
    ctx.roundRect(left, cardTop, cardWidth, cardHeight, 18)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.045)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.clip()
    ctx.fillStyle = control.color
    ctx.fillRect(left, cardTop, cardWidth, 6)
    ctx.restore()

    const inner = left + 26
    ctx.fillStyle = control.color
    ctx.beginPath()
    ctx.arc(inner + 6, cardTop + 48, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = font(600, 24)
    ctx.fillStyle = INK
    ctx.fillText(control.label, inner + 22, cardTop + 56)

    ctx.font = font(800, count > 3 ? 58 : 66)
    ctx.fillText(String(current), inner, cardTop + 126)

    ctx.font = font(600, 21)
    if (peak != null && peak > current) {
      ctx.fillStyle = MUTED
      ctx.fillText(`Peak ${peak}`, inner, cardTop + 160)
    } else if (peak != null) {
      ctx.fillStyle = '#22c55e'
      ctx.fillText('At peak', inner, cardTop + 160)
    }
  })

  // ── Recent form ──
  const formTop = 510
  if (data.form.length) {
    sectionLabel(ctx, 'Recent form', PAD, formTop)
    const size = 42
    data.form.forEach((result, i) => {
      const left = PAD + i * (size + 10)
      const top = formTop + 20
      ctx.beginPath()
      ctx.roundRect(left, top, size, size, 9)
      ctx.fillStyle = `${RESULT_COLORS[result]}33`
      ctx.fill()
      ctx.font = font(800, 20)
      ctx.fillStyle = RESULT_COLORS[result]
      ctx.textAlign = 'center'
      ctx.fillText(result.charAt(0).toUpperCase(), left + size / 2, top + 29)
      ctx.textAlign = 'left'
    })
  }

  // ── Where it's from ──
  ctx.font = font(500, 22)
  ctx.fillStyle = MUTED
  ctx.textAlign = 'right'
  ctx.fillText(data.site, CARD_WIDTH - PAD, formTop + 54)
  ctx.textAlign = 'left'
}
