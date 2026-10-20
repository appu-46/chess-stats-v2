import { useEffect, useRef, useState } from 'react'
import {
  transformChessComGame,
  transformLichessGame,
} from '../helpers/transformGame'
import { DEFAULT_PLATFORM } from '../helpers/platform'
import type {
  ChessComGame,
  LichessGame,
  TransformedGame,
} from '../helpers/transformGame'
import type { RawGame } from '../services/apiPlayer'
import type { Platform } from '../helpers/platform'

type TransformResult = {
  standardgamesData: Array<TransformedGame>
  // Keyed by time_class ('blitz', 'rapid', ...).
  byTimeClass: Partial<Record<string, Array<TransformedGame>>>
}

const CHUNK_SIZE = 200
const EMIT_THROTTLE_MS = 150

const EMPTY_RESULT: TransformResult = {
  standardgamesData: [],
  byTimeClass: {},
}

const transformCache = new Map<string, TransformResult>()

function gameId(game: RawGame): string {
  return 'url' in game ? game.url : game.id
}

function makeCacheKey(
  platform: Platform,
  username: string,
  games: Array<RawGame>,
): string {
  const first = games[0] ? gameId(games[0]) : ''
  const last = games.length ? gameId(games[games.length - 1]) : ''
  return `${platform}:${username}:${games.length}:${first}:${last}`
}

export function useProgressiveTransform(
  games: Array<RawGame> | null | undefined,
  username: string,
  platform: Platform = DEFAULT_PLATFORM,
) {
  const [transformedData, setTransformedData] =
    useState<TransformResult>(EMPTY_RESULT)
  const [progress, setProgress] = useState(100)
  const processingRef = useRef(false)

  useEffect(() => {
    if (!games?.length) {
      setTransformedData(EMPTY_RESULT)
      setProgress(100)
      return
    }

    const cacheKey = makeCacheKey(platform, username, games)
    const cached = transformCache.get(cacheKey)
    if (cached) {
      setTransformedData(cached)
      setProgress(100)
      return
    }

    setProgress(0)
    processingRef.current = true

    const lowerUsername = username.toLowerCase()

    // Variant games are dropped up front: chess.com returns undefined PGNs
    // for bughouse/crazyhouse etc., which breaks header parsing.
    const standard =
      platform === 'chess.com'
        ? (games as Array<ChessComGame>).filter(
            (game) => !game.rules || game.rules === 'chess',
          )
        : games

    const transformOne =
      platform === 'chess.com'
        ? (game: RawGame) =>
            transformChessComGame(game as ChessComGame, lowerUsername)
        : (game: RawGame) =>
            transformLichessGame(game as LichessGame, lowerUsername)

    const result: TransformResult = {
      standardgamesData: [],
      byTimeClass: {},
    }

    let index = 0
    const total = standard.length
    let lastEmit = 0

    function emit(finalProgress: number) {
      // Fresh outer objects so React sees a change; the arrays inside are
      // shared with the in-progress result and keep growing.
      setTransformedData({
        standardgamesData: result.standardgamesData,
        byTimeClass: { ...result.byTimeClass },
      })
      setProgress(finalProgress)
      lastEmit = Date.now()
    }

    function processChunk() {
      if (!processingRef.current) return

      const end = Math.min(index + CHUNK_SIZE, total)

      for (let i = index; i < end; i++) {
        try {
          const transformed = transformOne(standard[i])
          if (!transformed) continue

          result.standardgamesData.push(transformed)
          ;(result.byTimeClass[transformed.time_class] ||= []).push(transformed)
        } catch (error) {
          console.error(error)
          continue
        }
      }

      index = end
      const pct = total > 0 ? Math.round((index / total) * 100) : 100
      const isDone = index >= total
      const dueForEmit = Date.now() - lastEmit >= EMIT_THROTTLE_MS

      if (isDone || dueForEmit) {
        emit(pct)
      }

      if (!isDone) {
        setTimeout(processChunk, 0)
      } else {
        transformCache.set(cacheKey, result)
      }
    }

    processChunk()

    return () => {
      processingRef.current = false
    }
  }, [games, username, platform])

  return { transformedData, progress }
}
