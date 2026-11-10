import { describe, expect, it } from 'vitest'
import { gameId, gameSearch } from './gameLink'

describe('gameId', () => {
  it('takes the last part of the address', () => {
    expect(gameId('https://www.chess.com/game/live/123456789')).toBe(
      '123456789',
    )
    expect(gameId('https://www.chess.com/game/daily/42?move=3')).toBe('42')
    expect(gameId('https://lichess.org/AbCd1234')).toBe('AbCd1234')
  })

  it("drops lichess's side suffix", () => {
    expect(gameId('https://lichess.org/AbCd1234/black')).toBe('AbCd1234')
  })
})

describe('gameSearch', () => {
  it('points at the day the game ended', () => {
    const game = {
      url: 'https://lichess.org/AbCd1234/black',
      gameEndDate: '2026.10.05',
    }
    expect(gameSearch(game, 'lichess')).toEqual({
      year: '2026',
      month: '10',
      day: '05',
      game: 'AbCd1234',
      platform: 'lichess',
    })
    expect(gameSearch(game, 'chess.com')).not.toHaveProperty('platform')
  })
})
