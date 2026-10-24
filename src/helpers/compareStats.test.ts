import { describe, expect, it } from 'vitest'
import { compareStats, mergeTimeControls } from './compareStats'
import { validateCompareSearch } from './compareSearch'
import { getTimeControls } from './timeControls'
import type { TimeControlStat } from './normalizePlayer'

function stat(
  current: number,
  best: number,
  win: number,
  loss: number,
  draw: number,
): TimeControlStat {
  return {
    current,
    best: { rating: best, gameUrl: null },
    record: { win, loss, draw },
  }
}

describe('mergeTimeControls', () => {
  it("keeps A's order and adds B's other controls once", () => {
    const merged = mergeTimeControls(
      getTimeControls('chess.com'),
      getTimeControls('lichess'),
    ).map((control) => control.timeClass)
    expect(merged).toEqual([
      'blitz',
      'rapid',
      'bullet',
      'daily',
      'classical',
      'correspondence',
    ])
  })
})

describe('compareStats', () => {
  const controls = getTimeControls('chess.com')

  it('compares each metric and names the leader', () => {
    const [blitz] = compareStats(
      { blitz: stat(3200, 3300, 60, 30, 10) },
      { blitz: stat(3100, 3300, 50, 50, 0) },
      controls,
    )
    expect(blitz.control.timeClass).toBe('blitz')
    expect(
      blitz.metrics.map(({ key, a, b, leader }) => [key, a, b, leader]),
    ).toEqual([
      ['current', 3200, 3100, 'a'],
      // Equal peaks: nobody leads.
      ['peak', 3300, 3300, null],
      ['winRate', 60, 50, 'a'],
      ['games', 100, 100, null],
    ])
  })

  it('skips controls neither player has, and leaves no leader for a missing side', () => {
    const blocks = compareStats(
      { rapid: stat(2000, 2100, 1, 0, 0) },
      {},
      controls,
    )
    expect(blocks.map((block) => block.control.timeClass)).toEqual(['rapid'])
    expect(blocks[0].metrics[0]).toMatchObject({
      a: 2000,
      b: null,
      leader: null,
    })
  })

  it('has no win rate for a control with no games', () => {
    const [blitz] = compareStats(
      { blitz: stat(1500, 1500, 0, 0, 0) },
      { blitz: stat(1400, 1450, 1, 1, 0) },
      controls,
    )
    expect(blitz.metrics[2]).toMatchObject({ a: null, b: 50, leader: null })
  })
})

describe('compare search params', () => {
  it('keeps usernames as strings and lichess only where it applies', () => {
    expect(
      validateCompareSearch({
        a: 12345,
        ap: 'chess.com',
        b: 'drnykterstein',
        bp: 'lichess',
        range: '90D',
      }),
    ).toEqual({ a: '12345', b: 'drnykterstein', bp: 'lichess' })
    // A platform without its player is dropped.
    expect(validateCompareSearch({ ap: 'lichess', range: '1Y' })).toEqual({
      range: '1Y',
    })
  })
})
