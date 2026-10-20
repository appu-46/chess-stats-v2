type RatedGame = {
  PlayerELO: string
  endTime: number
}

export type RatingBucket = 'day' | 'week' | 'month'

// One row per bucket; each time class key holds the rating at the end of
// that bucket, or is absent if no game of that class was played in it.
export type RatingHistoryRow = { bucket: string } & Record<
  string,
  number | string | undefined
>

export interface RatingHistory {
  rows: Array<RatingHistoryRow>
  // Time classes that have at least one rated point, in the caller's order.
  series: Array<string>
  bucket: RatingBucket
}

// Keeps roughly 30-60 points on screen whatever the span: daily points up to
// ~6 weeks, weekly up to ~a year, monthly beyond.
export function pickRatingBucket(spanDays: number): RatingBucket {
  if (spanDays <= 45) return 'day'
  if (spanDays <= 400) return 'week'
  return 'month'
}

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

// Runs once per game on every progressive-load emit, so it uses native Date
// getters rather than dayjs: building and formatting a dayjs object per game
// was ~10x slower and made this the hottest code on the dashboard.
export function bucketKey(endTime: number, bucket: RatingBucket): string {
  const date = new Date(endTime * 1000)
  if (bucket === 'month') {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
  }
  if (bucket === 'week') {
    // Weeks start on Monday; getDay() is 0 for Sunday.
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function calculateRatingHistory(
  gamesByTimeClass: Record<string, Array<RatedGame> | undefined>,
  timeClasses: Array<string>,
  bucket?: RatingBucket,
): RatingHistory {
  let minTime = Infinity
  let maxTime = -Infinity
  for (const timeClass of timeClasses) {
    for (const game of gamesByTimeClass[timeClass] ?? []) {
      minTime = Math.min(minTime, game.endTime)
      maxTime = Math.max(maxTime, game.endTime)
    }
  }

  const resolvedBucket =
    bucket ??
    (Number.isFinite(minTime)
      ? pickRatingBucket((maxTime - minTime) / 86400)
      : 'day')

  const rowsByBucket = new Map<string, RatingHistoryRow>()
  const series: Array<string> = []

  for (const timeClass of timeClasses) {
    // Track the latest game per bucket explicitly rather than trusting the
    // input to be sorted.
    const latest = new Map<string, { endTime: number; rating: number }>()
    for (const game of gamesByTimeClass[timeClass] ?? []) {
      const rating = Number(game.PlayerELO)
      if (!game.PlayerELO || !Number.isFinite(rating) || rating <= 0) continue
      const key = bucketKey(game.endTime, resolvedBucket)
      const prev = latest.get(key)
      if (!prev || game.endTime >= prev.endTime) {
        latest.set(key, { endTime: game.endTime, rating })
      }
    }

    if (!latest.size) continue
    series.push(timeClass)
    for (const [key, { rating }] of latest) {
      const row = rowsByBucket.get(key) ?? { bucket: key }
      row[timeClass] = rating
      rowsByBucket.set(key, row)
    }
  }

  const rows = Array.from(rowsByBucket.values()).sort((a, b) =>
    a.bucket.localeCompare(b.bucket),
  )
  return { rows, series, bucket: resolvedBucket }
}
