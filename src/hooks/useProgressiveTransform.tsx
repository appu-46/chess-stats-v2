import { useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import { formatDate } from '../helpers/DateFormat'

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

const transformCache = new Map<string, { result: TransformResult; total: number }>()

function makeCacheKey(username: string, gamesLength: number): string {
  return `${username}:${gamesLength}`
}

export function useProgressiveTransform(games: Array<Game> | null | undefined, username: string) {
  const [transformedData, setTransformedData] = useState<TransformResult>(() => ({
    standardgamesData: [],
    chess960Games: [],
    blitzGames: [],
    rapidGames: [],
    bulletGames: [],
    dailyGames: [],
  }))
  const [progress, setProgress] = useState(100)
  const processingRef = useRef(false)

  useEffect(() => {
    if (!games?.length) {
      setTransformedData({
        standardgamesData: [],
        chess960Games: [],
        blitzGames: [],
        rapidGames: [],
        bulletGames: [],
        dailyGames: [],
      })
      setProgress(100)
      return
    }

    const cacheKey = makeCacheKey(username, games.length)
    const cached = transformCache.get(cacheKey)
    if (cached && cached.result.standardgamesData.length === cached.total) {
      setTransformedData(cached.result)
      setProgress(100)
      return
    }

    setProgress(0)
    processingRef.current = true

    const lowerUsername = username.toLowerCase()
    const chess = new Chess()

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

    function processChunk() {
      if (!processingRef.current) return

      const end = Math.min(index + CHUNK_SIZE, total)

      for (let i = index; i < end; i++) {
        const game = standard[i]
        try {
          const formattedDate = formatDate(game.end_time).formattedDateTime
          chess.loadPgn(game.pgn)

          const headers = chess.getHeaders()
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
            moveCount: Math.round(chess.history().length / 2),
            PlayerELO: isWhite ? headers.WhiteElo : headers.BlackElo,
            url: game.url,
            time_class: game.time_class,
          }
          chess.reset()

          result.standardgamesData.push(transformed)
          if (game.time_class === 'blitz') result.blitzGames.push(transformed)
          if (game.time_class === 'rapid') result.rapidGames.push(transformed)
          if (game.time_class === 'bullet') result.bulletGames.push(transformed)
          if (game.time_class === 'daily') result.dailyGames.push(transformed)
        } catch (error) {
          console.error(error)
          chess.reset()
          continue
        }
      }

      index = end
      setTransformedData({
        standardgamesData: result.standardgamesData,
        chess960Games: result.chess960Games,
        blitzGames: result.blitzGames,
        rapidGames: result.rapidGames,
        bulletGames: result.bulletGames,
        dailyGames: result.dailyGames,
      })
      setProgress(Math.round((index / total) * 100))

      if (index < total) {
        setTimeout(processChunk, 0)
      } else {
        setProgress(100)
        transformCache.set(cacheKey, { result, total })
      }
    }

    processChunk()

    return () => {
      processingRef.current = false
    }
  }, [games, username])

  return { transformedData, progress }
}
