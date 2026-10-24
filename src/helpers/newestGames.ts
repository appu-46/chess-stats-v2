import { transformChessComGame, transformLichessGame } from './transformGame'
import type {
  ChessComGame,
  LichessGame,
  TransformedGame,
} from './transformGame'
import type { RawGame } from '../services/apiPlayer'
import type { Platform } from './platform'

// The newest `count` of a handful of raw games (as fetchLatestGames returns
// them, oldest first), transformed, newest first. Small lists only: this
// runs inline rather than through useProgressiveTransform's chunked loop.
export function newestGames(
  games: Array<RawGame>,
  lowerUsername: string,
  platform: Platform,
  count: number,
): Array<TransformedGame> {
  const transformed: Array<TransformedGame> = []
  for (const game of games) {
    try {
      const result =
        platform === 'lichess'
          ? transformLichessGame(game as LichessGame, lowerUsername)
          : transformChessComGame(game as ChessComGame, lowerUsername)
      if (result) transformed.push(result)
    } catch (error) {
      console.error(error)
    }
  }
  return transformed.slice(-count).reverse()
}
