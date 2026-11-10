import { describe, expect, it } from 'vitest'
import {
  buildReplay,
  clocksAt,
  formatClock,
  gameEnding,
  kingSquares,
} from './gameReplay'

const PGN = `[Event "Live Chess"]
[White "a"]
[Black "b"]
[Result "1-0"]

1. e4 {[%clk 0:02:59.9]} 1... e5 {[%clk 0:02:58]} 2. Qh5 {[%clk 0:02:57.1]} 2... Nc6 {[%clk 0:02:55]} 3. Bc4 {[%clk 0:02:56]} 3... Nf6 {[%clk 0:02:50.2]} 4. Qxf7# {[%clk 0:02:55.5]} 1-0`

describe('buildReplay', () => {
  it('reads a chess.com PGN with its clocks', () => {
    const replay = buildReplay(PGN)
    expect(replay.moves).toHaveLength(7)
    expect(replay.startFen).toMatch(/^rnbqkbnr\/pppppppp/)
    expect(replay.moves[0]).toMatchObject({
      san: 'e4',
      from: 'e2',
      to: 'e4',
      color: 'w',
      clock: '0:02:59.9',
    })
    expect(replay.moves[6].san).toBe('Qxf7#')
    expect(replay.moves[6].fen).toContain('pppp1Qpp')
  })

  it('reads a bare lichess move list, without clocks', () => {
    const replay = buildReplay('e4 e5 Nf3 Nc6 Bb5')
    expect(replay.moves.map((move) => move.san)).toEqual([
      'e4',
      'e5',
      'Nf3',
      'Nc6',
      'Bb5',
    ])
    expect(replay.moves[0].clock).toBeNull()
  })

  it('throws on a game with no moves', () => {
    expect(() => buildReplay('')).toThrow()
  })
})

describe('clocksAt', () => {
  it('gives each side its clock after its latest move', () => {
    const { moves } = buildReplay(PGN)
    expect(clocksAt(moves, 0)).toEqual({ white: null, black: null })
    expect(clocksAt(moves, 3)).toEqual({ white: '0:02:57.1', black: '0:02:58' })
  })
})

describe('formatClock', () => {
  it('drops the hours and tenths when they add nothing', () => {
    expect(formatClock('0:02:57.9')).toBe('2:57')
    expect(formatClock('1:05:00')).toBe('1:05:00')
    expect(formatClock('0:00:07.3')).toBe('0:07.3')
    expect(formatClock('0:10:00')).toBe('10:00')
  })
})

describe('gameEnding', () => {
  it('reads who won and how', () => {
    expect(gameEnding('1-0', 'Hikaru won by checkmate')).toEqual({
      winner: 'white',
      reason: 'checkmate',
    })
    expect(gameEnding('0-1', 'b won by resignation').reason).toBe('resignation')
    expect(gameEnding('0-1', 'b won on time')).toEqual({
      winner: 'black',
      reason: 'timeout',
    })
    expect(gameEnding('1-0', 'a won - game abandoned').reason).toBe(
      'abandonment',
    )
  })

  it('tells the kinds of draw apart', () => {
    const reason = (text: string) => gameEnding('1/2-1/2', text).reason
    expect(reason('Game drawn by repetition')).toBe('repetition')
    expect(reason('Game drawn by stalemate')).toBe('stalemate')
    expect(reason('Game drawn by agreement')).toBe('agreement')
    expect(reason('Game drawn by 50-move rule')).toBe('fiftyMoves')
    expect(reason('Game drawn by insufficient material')).toBe(
      'insufficientMaterial',
    )
    expect(reason('Game drawn by timeout vs insufficient material')).toBe(
      'timeoutVsInsufficient',
    )
  })

  it('falls back on the final position when the site gives no reason', () => {
    const { finalPosition } = buildReplay('Nf3 Nf6 Ng1 Ng8 Nf3 Nf6 Ng1 Ng8')
    expect(finalPosition.repetition).toBe(true)
    expect(gameEnding('1/2-1/2', 'Game drawn', finalPosition).reason).toBe(
      'repetition',
    )
    expect(gameEnding('1/2-1/2', 'Game drawn').reason).toBe('agreement')
  })
})

describe('kingSquares', () => {
  it('finds both kings', () => {
    expect(
      kingSquares('r1bq1rk1/pppp1ppp/8/8/8/8/PPPP1PPP/R1BQ1RK1 w - - 0 1'),
    ).toEqual({ white: 'g1', black: 'g8' })
    expect(kingSquares('8/8/4k3/8/8/8/8/K7 w - - 0 1')).toEqual({
      white: 'a1',
      black: 'e6',
    })
  })
})
