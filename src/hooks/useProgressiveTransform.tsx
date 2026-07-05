import { useEffect, useRef, useState } from 'react'
import { formatDate } from '../helpers/DateFormat'
import { parsePgnLite } from '../helpers/PgnParseLite'

type Game = {
  url: string
  time_control: string
  black: { username: string; result: string }
  white: { username: string; result: string }
  pgn: string
  end_time: number
  time_class: string
  result: string
  rules?: string
  fen: string
}

type TransformedGame = {
  BlackElo: string
  PlayerELO: string
  Result: string
  TimeControl: string
  WhiteElo: string
  blackPlayer: string
  date_time: string
  gameEndDate: string
  moveCount: number
  resultForPlayer: 'win' | 'loss' | 'draw'
  time_class: string
  url: string
  whitePlayer: string
  Termination: string
}

type Chess960Game = {
  date: string
  result: string
  whitePlayer: string
  blackPlayer: string
  pgn: string
  url: string
}

type TransformResult = {
  standardgamesData: Array<TransformedGame>
  chess960Games: Array<Chess960Game>
  blitzGames: Array<TransformedGame>
  rapidGames: Array<TransformedGame>
  bulletGames: Array<TransformedGame>
  dailyGames: Array<TransformedGame>
}

const CHUNK_SIZE = 200
const EMIT_THROTTLE_MS = 150

const EMPTY_RESULT: TransformResult = {
  standardgamesData: [],
  chess960Games: [],
  blitzGames: [],
  rapidGames: [],
  bulletGames: [],
  dailyGames: [],
}

const transformCache = new Map<string, TransformResult>()

function makeCacheKey(username: string, games: Array<Game>): string {
  const first = games[0]?.url ?? ''
  const last = games[games.length - 1]?.url ?? ''
  return `${username}:${games.length}:${first}:${last}`
}

export function useProgressiveTransform(
  games: Array<Game> | null | undefined,
  username: string,
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

    const cacheKey = makeCacheKey(username, games)
    const cached = transformCache.get(cacheKey)
    if (cached) {
      setTransformedData(cached)
      setProgress(100)
      return
    }

    setProgress(0)
    processingRef.current = true

    const lowerUsername = username.toLowerCase()

    const { chess960, standard } = games.reduce(
      (acc, game) => {
        if (game.rules === 'chess960') acc.chess960.push(game)
        else if (!game.rules || game.rules === 'chess') acc.standard.push(game)
        return acc
      },
      { chess960: [] as Array<Game>, standard: [] as Array<Game> },
    )

    const result: TransformResult = {
      standardgamesData: [],
      chess960Games: [],
      blitzGames: [],
      rapidGames: [],
      bulletGames: [],
      dailyGames: [],
    }

    result.chess960Games = chess960.map((game) => ({
      date: formatDate(game.end_time).formattedDateTime,
      result: game.result,
      whitePlayer: game.white.username,
      blackPlayer: game.black.username,
      pgn: game.pgn,
      url: game.url,
    }))

    let index = 0
    const total = standard.length
    let lastEmit = 0

    function emit(finalProgress: number) {
      setTransformedData({
        standardgamesData: result.standardgamesData,
        chess960Games: result.chess960Games,
        blitzGames: result.blitzGames,
        rapidGames: result.rapidGames,
        bulletGames: result.bulletGames,
        dailyGames: result.dailyGames,
      })
      setProgress(finalProgress)
      lastEmit = Date.now()
    }

    function processChunk() {
      if (!processingRef.current) return

      const end = Math.min(index + CHUNK_SIZE, total)

      for (let i = index; i < end; i++) {
        const game = standard[i]
        try {
          const formattedDate = formatDate(game.end_time).formattedDateTime
          const { headers, moveCount, isValid } = parsePgnLite(game.pgn)

          // Skip malformed entries the way the old try/catch around
          // loadPgn used to - no legality check, but catches the
          // realistic failure mode of an empty/garbage movetext.
          if (!isValid || !headers.White || !headers.Black) continue

          const isWhite = headers.White.toLowerCase() === lowerUsername

          let gameResult: 'win' | 'loss' | 'draw'
          if (headers.Result === '1-0') {
            gameResult = isWhite ? 'win' : 'loss'
          } else if (headers.Result === '0-1') {
            gameResult = isWhite ? 'loss' : 'win'
          } else {
            gameResult = 'draw'
          }

          const transformed: TransformedGame = {
            date_time: formattedDate,
            gameEndDate: headers.EndDate,
            Result: headers.Result,
            resultForPlayer: gameResult,
            whitePlayer: headers.White,
            blackPlayer: headers.Black,
            BlackElo: headers.BlackElo,
            WhiteElo: headers.WhiteElo,
            TimeControl: headers.TimeControl,
            Termination: headers.Termination,
            moveCount,
            PlayerELO: isWhite ? headers.WhiteElo : headers.BlackElo,
            url: game.url,
            time_class: game.time_class,
          }

          result.standardgamesData.push(transformed)
          if (game.time_class === 'blitz') result.blitzGames.push(transformed)
          if (game.time_class === 'rapid') result.rapidGames.push(transformed)
          if (game.time_class === 'bullet') result.bulletGames.push(transformed)
          if (game.time_class === 'daily') result.dailyGames.push(transformed)
        } catch (error) {
          console.error(error)
          continue
        }
      }

      index = end
      const pct = Math.round((index / total) * 100)
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
  }, [games, username])

  return { transformedData, progress }
}
