import { describe, expect, it } from 'vitest'
import {
  bucketKey,
  calculateRatingHistory,
  pickRatingBucket,
} from './calculateRatingHistory'

// Noon UTC keeps the local calendar date stable for any test-runner timezone
// within +/-11h.
function at(isoDate: string, hourOffset = 0) {
  return Date.parse(`${isoDate}T12:00:00Z`) / 1000 + hourOffset * 60
}

function rated(PlayerELO: string, endTime: number) {
  return { PlayerELO, endTime }
}

describe('pickRatingBucket', () => {
  it('widens the bucket as the span grows', () => {
    expect(pickRatingBucket(7)).toBe('day')
    expect(pickRatingBucket(90)).toBe('week')
    expect(pickRatingBucket(365)).toBe('week')
    expect(pickRatingBucket(1000)).toBe('month')
  })
})

describe('bucketKey', () => {
  it('starts weeks on Monday', () => {
    // 2026-10-18 is a Sunday, 2026-10-19 a Monday.
    expect(bucketKey(at('2026-10-18'), 'week')).toBe('2026-10-12')
    expect(bucketKey(at('2026-10-19'), 'week')).toBe('2026-10-19')
    expect(bucketKey(at('2026-10-25'), 'week')).toBe('2026-10-19')
  })

  it('formats day and month keys', () => {
    expect(bucketKey(at('2026-10-18'), 'day')).toBe('2026-10-18')
    expect(bucketKey(at('2026-10-18'), 'month')).toBe('2026-10')
  })
})

describe('calculateRatingHistory', () => {
  it('returns no rows or series for no games', () => {
    expect(calculateRatingHistory({}, ['blitz'])).toEqual({
      rows: [],
      series: [],
      bucket: 'day',
    })
  })

  it('takes the latest rating in each bucket, regardless of input order', () => {
    const history = calculateRatingHistory(
      {
        blitz: [
          rated('1510', at('2026-10-01', 30)),
          rated('1500', at('2026-10-01', 10)),
          rated('1520', at('2026-10-02')),
        ],
      },
      ['blitz'],
      'day',
    )
    expect(history.rows).toEqual([
      { bucket: '2026-10-01', blitz: 1510 },
      { bucket: '2026-10-02', blitz: 1520 },
    ])
  })

  it('merges time classes into shared rows, leaving gaps where unplayed', () => {
    const history = calculateRatingHistory(
      {
        blitz: [
          rated('1500', at('2026-01-05')),
          rated('1550', at('2026-03-05')),
        ],
        rapid: [rated('1700', at('2026-03-10'))],
        bullet: [],
      },
      ['blitz', 'rapid', 'bullet'],
      'month',
    )
    expect(history.series).toEqual(['blitz', 'rapid'])
    expect(history.rows).toEqual([
      { bucket: '2026-01', blitz: 1500 },
      { bucket: '2026-03', blitz: 1550, rapid: 1700 },
    ])
  })

  it('ignores games without a usable rating', () => {
    const history = calculateRatingHistory(
      { blitz: [rated('', at('2026-01-05')), rated('abc', at('2026-01-06'))] },
      ['blitz'],
    )
    expect(history.series).toEqual([])
    expect(history.rows).toEqual([])
  })

  it('picks a bucket from the span when none is given', () => {
    const history = calculateRatingHistory(
      {
        blitz: [
          rated('1500', at('2025-01-01')),
          rated('1600', at('2026-10-01')),
        ],
      },
      ['blitz'],
    )
    expect(history.bucket).toBe('month')
  })
})
