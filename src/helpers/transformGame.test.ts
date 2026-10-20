import { describe, expect, it } from 'vitest'
import { categorizeTermination } from './calculateWinRateBreakdown'
import {
  lichessTermination,
  transformChessComGame,
  transformLichessGame,
} from './transformGame'
import type { ChessComGame, LichessGame } from './transformGame'

const CHESS_COM_PGN = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.09.08"]
[White "michobr"]
[Black "Hikaru"]
[Result "0-1"]
[ECO "B22"]
[ECOUrl "https://www.chess.com/openings/Alapin-Sicilian-Defense-2...Qa5"]
[WhiteElo "2709"]
[BlackElo "3370"]
[TimeControl "300"]
[Termination "Hikaru won by resignation"]
[EndDate "2026.09.08"]

1. e4 {[%clk 0:04:53.5]} 1... c5 {[%clk 0:04:54.8]} 2. c3 {[%clk 0:04:52.3]} 2... Qa5 {[%clk 0:04:49.7]} 3. Na3 {[%clk 0:04:50.7]} 0-1`

function chessComGame(overrides: Partial<ChessComGame> = {}): ChessComGame {
  return {
    url: 'https://www.chess.com/game/live/183193101523',
    time_control: '300',
    white: { username: 'michobr', result: 'resigned' },
    black: { username: 'Hikaru', result: 'win' },
    pgn: CHESS_COM_PGN,
    end_time: 1788966473,
    time_class: 'blitz',
    rules: 'chess',
    fen: '',
    ...overrides,
  }
}

function lichessGame(overrides: Partial<LichessGame> = {}): LichessGame {
  return {
    id: 'fWFrV4Wo',
    rated: true,
    variant: 'standard',
    speed: 'blitz',
    perf: 'blitz',
    createdAt: 1646075161579,
    lastMoveAt: 1646075452073,
    status: 'resign',
    players: {
      white: {
        user: { name: 'kyart2', id: 'kyart2', title: 'GM' },
        rating: 2863,
      },
      black: {
        user: { name: 'DrNykterstein', id: 'drnykterstein', title: 'GM' },
        rating: 3219,
      },
    },
    winner: 'black',
    opening: {
      eco: 'A01',
      name: 'Nimzo-Larsen Attack: Modern Variation',
      ply: 4,
    },
    moves: 'b3 e5 Bb2 Nc6 c4',
    clock: { initial: 180, increment: 0, totalTime: 180 },
    ...overrides,
  }
}

describe('transformChessComGame', () => {
  it('reads result, ratings and opening from the PGN headers', () => {
    const game = transformChessComGame(chessComGame(), 'hikaru')
    expect(game).toMatchObject({
      resultForPlayer: 'win',
      PlayerELO: '3370',
      whitePlayer: 'michobr',
      blackPlayer: 'Hikaru',
      gameEndDate: '2026.09.08',
      endTime: 1788966473,
      moveCount: 3,
      time_class: 'blitz',
      opening: 'Alapin Sicilian Defense',
      openingFamily: 'Alapin Sicilian Defense',
      eco: 'B22',
    })
  })

  it('returns null for a PGN with no movetext', () => {
    expect(
      transformChessComGame(chessComGame({ pgn: '[Result "1-0"]' }), 'hikaru'),
    ).toBeNull()
  })
})

describe('transformLichessGame', () => {
  it('normalizes a finished game from the player perspective', () => {
    const game = transformLichessGame(lichessGame(), 'drnykterstein')
    expect(game).toMatchObject({
      Result: '0-1',
      resultForPlayer: 'win',
      PlayerELO: '3219',
      WhiteElo: '2863',
      BlackElo: '3219',
      whitePlayer: 'kyart2',
      blackPlayer: 'DrNykterstein',
      TimeControl: '180+0',
      Termination: 'DrNykterstein won by resignation',
      moveCount: 3,
      time_class: 'blitz',
      endTime: 1646075452,
      url: 'https://lichess.org/fWFrV4Wo/black',
      opening: 'Nimzo-Larsen Attack: Modern Variation',
      openingFamily: 'Nimzo-Larsen Attack',
      eco: 'A01',
    })
    expect(game?.gameEndDate).toMatch(/^\d{4}\.\d{2}\.\d{2}$/)
  })

  it('scores a game with no winner as a draw', () => {
    const game = transformLichessGame(
      lichessGame({ winner: undefined, status: 'stalemate' }),
      'kyart2',
    )
    expect(game?.Result).toBe('1/2-1/2')
    expect(game?.resultForPlayer).toBe('draw')
    expect(game?.url).toBe('https://lichess.org/fWFrV4Wo')
  })

  it('names computer and anonymous opponents', () => {
    const game = transformLichessGame(
      lichessGame({
        players: {
          white: { user: { name: 'thibault', id: 'thibault' }, rating: 1500 },
          black: { aiLevel: 3 },
        },
        winner: 'white',
      }),
      'thibault',
    )
    expect(game?.blackPlayer).toBe('Stockfish level 3')
    expect(game?.BlackElo).toBe('')
  })

  it('skips aborted and non-standard games', () => {
    expect(
      transformLichessGame(lichessGame({ status: 'aborted' }), 'kyart2'),
    ).toBeNull()
    expect(
      transformLichessGame(lichessGame({ variant: 'chess960' }), 'kyart2'),
    ).toBeNull()
  })
})

describe('lichessTermination', () => {
  it('produces sentences categorizeTermination understands', () => {
    const cases: Array<[string, string | null, string]> = [
      ['mate', 'A', 'Checkmate'],
      ['resign', 'A', 'Resignation'],
      ['outoftime', 'A', 'Timeout'],
      ['timeout', 'A', 'Abandonment'],
      ['noStart', 'A', 'Abandonment'],
      ['stalemate', null, 'Stalemate'],
      ['insufficientMaterialClaim', null, 'Insufficient Material'],
      ['draw', null, 'Other'],
      ['cheat', 'A', 'Other'],
    ]
    for (const [status, winner, category] of cases) {
      expect(categorizeTermination(lichessTermination(status, winner))).toBe(
        category,
      )
    }
  })
})
