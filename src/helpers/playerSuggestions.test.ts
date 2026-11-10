import { describe, expect, it } from 'vitest'
import { mergeSuggestions } from './playerSuggestions'

const famous = [
  { username: 'Hikaru', name: 'Hikaru Nakamura' },
  { username: 'MagnusCarlsen', name: 'Magnus Carlsen' },
]
const titled = [
  { username: 'hikaru', title: 'GM' },
  { username: 'hikarunotreally', title: 'FM' },
  { username: 'magnuscarlsen', title: 'GM' },
  { username: 'magnet', title: 'IM' },
]

const names = (list: Array<{ username: string }>) =>
  list.map((player) => player.username)

describe('mergeSuggestions', () => {
  it('lists one row per account and fills in the title', () => {
    const result = mergeSuggestions('hik', { famous, titled })
    expect(names(result)).toEqual(['Hikaru', 'hikarunotreally'])
    expect(result[0]).toMatchObject({ title: 'GM', name: 'Hikaru Nakamura' })
  })

  it('finds famous players by any word of their name', () => {
    expect(names(mergeSuggestions('carl', { famous, titled }))).toEqual([
      'MagnusCarlsen',
    ])
  })

  it('orders recent, famous, the exact account, cached and titled', () => {
    const result = mergeSuggestions('mag', {
      exact: { username: 'Mag' },
      recent: [{ username: 'magnet' }, { username: 'someoneelse' }],
      famous,
      cached: [{ username: 'MagicMike' }],
      titled,
    })
    expect(names(result)).toEqual([
      'magnet',
      'MagnusCarlsen',
      'Mag',
      'MagicMike',
    ])
    expect(result[0]).toMatchObject({ recent: true, title: 'IM' })
  })

  it('shows only recent players before anything is typed', () => {
    const result = mergeSuggestions('', {
      recent: [{ username: 'magnet' }],
      famous,
      cached: [{ username: 'MagicMike' }],
      titled,
    })
    expect(names(result)).toEqual(['magnet'])
  })

  it('stops at the maximum', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ username: `ab${i}` }))
    expect(mergeSuggestions('ab', { titled: many }, 10)).toHaveLength(10)
  })
})
