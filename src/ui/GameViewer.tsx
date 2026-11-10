// Replays one game on a board: step through the moves, jump to any of
// them, or let it play. Opened from a row of a game list. Loaded on
// demand (see GameViewerModal), as it brings chess.js and the board.
import { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Chessboard } from 'react-chessboard'
import {
  TbClock,
  TbCrown,
  TbDoorExit,
  TbFlag,
  TbLock,
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbPlayerSkipBackFilled,
  TbPlayerSkipForwardFilled,
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
  TbRepeat,
  TbX,
} from 'react-icons/tb'
import { FiExternalLink } from 'react-icons/fi'
import {
  END_REASON_LABELS,
  buildReplay,
  clocksAt,
  formatClock,
  gameEnding,
  kingSquares,
} from '../helpers/gameReplay'
import { PLATFORM_LABELS } from '../helpers/platform'
import { RESULT_COLORS, SideDot } from './GameResult'
import type { ReactNode } from 'react'
import type { EndReason, Replay } from '../helpers/gameReplay'
import type { TransformedGame } from '../helpers/transformGame'
import type { Platform } from '../helpers/platform'

const AUTOPLAY_MS = 900

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 26rem) minmax(13rem, 1fr);
  gap: 1.25rem;
  align-items: stretch;

  /* Phones and narrow windows: the moves go under the board. */
  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }
`

const BoardColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  /* On a short, wide screen the board is sized by the height left over. */
  width: 100%;
  max-width: min(26rem, 100dvh - 19rem);
  margin: 0 auto;

  /* Phones: the moves sit under the board, so leave them room too. */
  @media (max-width: 768px) {
    max-width: min(26rem, 100dvh - 23rem);
  }
`

const PlayerBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  font-size: 0.95rem;
  font-weight: 600;
`

const PlayerName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Muted = styled.span`
  flex-shrink: 0;
  font-weight: 400;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
`

const Clock = styled.span<{ $active: boolean }>`
  margin-left: auto;
  flex-shrink: 0;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
  background: light-dark(rgba(0, 0, 0, 0.07), rgba(255, 255, 255, 0.08));
  opacity: ${({ $active }) => ($active ? 1 : 0.6)};
  box-shadow: ${({ $active }) =>
    $active ? 'inset 0 0 0 1.5px var(--brand-border)' : 'none'};
`

const BoardFrame = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  /* Stops the page scrolling or zooming when the board is touched. */
  touch-action: manipulation;
`

// On the last move, a round marker in the top-right corner of each king's
// square: a crown for the winner, how they lost for the loser, and the
// kind of draw on both. Placed by the square's column and row (0-7 from
// the top-left as the board is shown).
const KingBadge = styled.span<{
  $column: number
  $row: number
  $color: string
}>`
  position: absolute;
  left: ${({ $column }) => ($column + 1) * 12.5}%;
  top: ${({ $row }) => $row * 12.5}%;
  width: 6%;
  aspect-ratio: 1;
  transform: translate(-108%, 8%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  /* The ring keeps it apart from a square tinted the same colour. */
  border: 1.5px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
  font-size: clamp(0.5rem, 2.6vw, 0.72rem);
  font-weight: 800;
  line-height: 1;
  pointer-events: auto;
  animation: king-badge-pop 0.25s ease-out;

  && {
    color: white;
  }

  svg {
    width: 72%;
    height: 72%;
  }

  @keyframes king-badge-pop {
    from {
      transform: translate(-108%, 8%) scale(0.3);
      opacity: 0;
    }
  }
`

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.4rem;
`

const ControlButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 4rem;
  height: 2.75rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: ${({ $primary }) => ($primary ? 'var(--on-brand)' : 'inherit')};
  background: ${({ $primary }) =>
    $primary
      ? 'var(--brand-fill)'
      : 'light-dark(rgba(0, 0, 0, 0.07), rgba(255, 255, 255, 0.08))'};

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  &:not(:disabled):hover,
  &:focus-visible {
    background: ${({ $primary }) =>
      $primary
        ? 'var(--brand-fill-hover)'
        : 'light-dark(rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.14))'};
  }
`

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  min-height: 0;
`

const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.88rem;

  & > span:last-child {
    opacity: 0.65;
  }
`

// Fills the space beside the board on wide screens; a fixed-height strip
// under it on phones.
const MoveList = styled.ol`
  flex: 1 1 0;
  min-height: 7rem;
  margin: 0;
  padding: 0.4rem;
  list-style: none;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 2.25rem 1fr 1fr;
  align-content: start;
  gap: 0.1rem 0.25rem;
  border-radius: 10px;
  background: light-dark(rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.22));
  font-variant-numeric: tabular-nums;

  @media (max-width: 768px) {
    flex: none;
    height: 6.5rem;
  }
`

const MoveNumber = styled.li`
  padding: 0.3rem 0.25rem;
  text-align: right;
  font-size: 0.85rem;
  opacity: 0.45;
`

const MoveButton = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 0.3rem 0.5rem;
  border: none;
  border-radius: 6px;
  text-align: left;
  font: inherit;
  font-size: 0.92rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;
  color: ${({ $active }) => ($active ? 'var(--on-brand)' : 'inherit')};
  background: ${({ $active }) => ($active ? 'var(--brand-fill)' : 'none')};

  &:hover {
    background: ${({ $active }) =>
      $active
        ? 'var(--brand-fill)'
        : 'light-dark(rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.08))'};
  }
`

const SiteLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  font-size: 0.88rem;
  font-weight: 600;
  color: light-dark(var(--brand), var(--brand-soft));
  text-decoration: none;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
`

const Problem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
`

const LAST_MOVE_STYLE = { background: 'rgba(255, 213, 79, 0.45)' }

// The losing king's marker says how the game was lost; in a draw both
// kings carry the kind of draw ("½" where there's no better picture).
const END_ICONS: Record<EndReason, ReactNode> = {
  checkmate: '#',
  resignation: <TbFlag />,
  timeout: <TbClock />,
  abandonment: <TbDoorExit />,
  stalemate: <TbLock />,
  repetition: <TbRepeat />,
  fiftyMoves: '50',
  timeoutVsInsufficient: <TbClock />,
  insufficientMaterial: '½',
  agreement: '½',
  other: <TbX />,
}

function squareTint(color: string) {
  return { background: `color-mix(in srgb, ${color} 62%, transparent)` }
}

function GameViewer({
  game,
  username,
  platform,
}: {
  game: TransformedGame
  // The player whose games these are: the board starts from their side.
  username: string
  platform: Platform
}) {
  const replay = useMemo((): Replay | null => {
    try {
      return buildReplay(game.moves)
    } catch (error) {
      console.error(error)
      return null
    }
  }, [game.moves])

  const playerIsBlack =
    game.blackPlayer.toLowerCase() === username.toLowerCase()
  const [orientation, setOrientation] = useState<'white' | 'black'>(
    playerIsBlack ? 'black' : 'white',
  )
  // How many moves have been played on the board: 0 is the start.
  const [ply, setPly] = useState(0)
  const [playing, setPlaying] = useState(false)
  const total = replay?.moves.length ?? 0
  const activeMove = useRef<HTMLButtonElement>(null)
  const moveList = useRef<HTMLOListElement>(null)

  useEffect(() => {
    if (!playing) return
    if (ply >= total) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => setPly((value) => value + 1), AUTOPLAY_MS)
    return () => clearTimeout(timer)
  }, [playing, ply, total])

  // Arrow keys step, Home/End jump, Space plays, as on the chess sites.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const go = (next: number) => {
        event.preventDefault()
        setPlaying(false)
        setPly(Math.max(0, Math.min(total, next)))
      }
      if (event.key === 'ArrowLeft') go(ply - 1)
      else if (event.key === 'ArrowRight') go(ply + 1)
      else if (event.key === 'Home') go(0)
      else if (event.key === 'End') go(total)
      else if (
        event.key === ' ' &&
        !(event.target instanceof HTMLButtonElement)
      ) {
        event.preventDefault()
        setPlaying((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [ply, total])

  // Keep the current move in view by scrolling the list itself.
  // scrollIntoView would also scroll the popup, and on a short phone that
  // pushes the board off the top of the screen.
  useEffect(() => {
    const list = moveList.current
    if (!list) return
    const move = activeMove.current
    if (!move) {
      list.scrollTop = 0
      return
    }
    const top = move.offsetTop - list.offsetTop
    if (top < list.scrollTop) list.scrollTop = top - 4
    else if (top + move.offsetHeight > list.scrollTop + list.clientHeight)
      list.scrollTop = top + move.offsetHeight - list.clientHeight + 4
  }, [ply])

  const siteLink = (
    <SiteLink href={game.url} target="_blank" rel="noopener noreferrer">
      Open on {PLATFORM_LABELS[platform]} <FiExternalLink size={14} />
    </SiteLink>
  )

  if (!replay) {
    return (
      <Problem>
        <span>This game's moves couldn't be read here.</span>
        {siteLink}
      </Problem>
    )
  }

  const current = ply > 0 ? replay.moves[ply - 1] : null
  const clocks = clocksAt(replay.moves, ply)
  // Whose move it is in the position shown.
  const toMove = current ? (current.color === 'w' ? 'black' : 'white') : 'white'
  const atEnd = ply >= total

  function step(next: number) {
    setPlaying(false)
    setPly(Math.max(0, Math.min(total, next)))
  }

  function playerBar(side: 'white' | 'black') {
    const clock = clocks[side]
    return (
      <PlayerBar>
        <SideDot $side={side} title={side === 'white' ? 'White' : 'Black'} />
        <PlayerName>
          {side === 'white' ? game.whitePlayer : game.blackPlayer}
        </PlayerName>
        <Muted>{side === 'white' ? game.WhiteElo : game.BlackElo}</Muted>
        {clock && (
          <Clock $active={!atEnd && toMove === side}>
            {formatClock(clock)}
          </Clock>
        )}
      </PlayerBar>
    )
  }

  const top = orientation === 'white' ? 'black' : 'white'

  // The final position marks the kings: green for the winner, red for the
  // loser, blue-grey for a draw, each with how it ended.
  const ending = atEnd
    ? gameEnding(game.Result, game.Termination, replay.finalPosition)
    : null
  const kings = ending && current ? kingSquares(current.fen) : null
  const kingMarks =
    ending && kings
      ? (['white', 'black'] as const).map((side) => {
          const isDraw = ending.winner === null
          const won = ending.winner === side
          const square = kings[side]
          const file = 'abcdefgh'.indexOf(square[0])
          const rank = Number(square[1])
          return {
            side,
            square,
            color: isDraw
              ? RESULT_COLORS.draw
              : won
                ? RESULT_COLORS.win
                : RESULT_COLORS.loss,
            icon: won ? <TbCrown /> : END_ICONS[ending.reason],
            label: isDraw
              ? `Draw: ${END_REASON_LABELS[ending.reason]}`
              : won
                ? 'Winner'
                : `Lost: ${END_REASON_LABELS[ending.reason]}`,
            column: orientation === 'white' ? file : 7 - file,
            row: orientation === 'white' ? 8 - rank : rank - 1,
          }
        })
      : []

  return (
    <Layout>
      <BoardColumn>
        {playerBar(top)}
        <BoardFrame>
          <Chessboard
            options={{
              id: 'game-viewer',
              position: current ? current.fen : replay.startFen,
              boardOrientation: orientation,
              allowDragging: false,
              allowDrawingArrows: false,
              animationDurationInMs: 180,
              darkSquareStyle: { backgroundColor: '#5f9a7d' },
              lightSquareStyle: { backgroundColor: '#e9f3ec' },
              squareStyles: current
                ? {
                    [current.from]: LAST_MOVE_STYLE,
                    [current.to]: LAST_MOVE_STYLE,
                    // After the last move's highlight, so a king that just
                    // moved still shows its result colour.
                    ...Object.fromEntries(
                      kingMarks.map((mark) => [
                        mark.square,
                        squareTint(mark.color),
                      ]),
                    ),
                  }
                : {},
            }}
          />
          {kingMarks.map((mark) => (
            <KingBadge
              key={mark.side}
              $column={mark.column}
              $row={mark.row}
              $color={mark.color}
              title={mark.label}
              role="img"
              aria-label={`${mark.side === 'white' ? 'White' : 'Black'}: ${mark.label}`}
            >
              {mark.icon}
            </KingBadge>
          ))}
        </BoardFrame>
        {playerBar(orientation)}

        <Controls>
          <ControlButton
            onClick={() => step(0)}
            disabled={ply === 0}
            aria-label="First move"
          >
            <TbPlayerSkipBackFilled size={18} />
          </ControlButton>
          <ControlButton
            onClick={() => step(ply - 1)}
            disabled={ply === 0}
            aria-label="Previous move"
          >
            <TbPlayerTrackPrevFilled size={18} />
          </ControlButton>
          <ControlButton
            $primary
            onClick={() => {
              // Playing from the last move starts the game over.
              if (!playing && atEnd) setPly(0)
              setPlaying((value) => !value)
            }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <TbPlayerPauseFilled size={18} />
            ) : (
              <TbPlayerPlayFilled size={18} />
            )}
          </ControlButton>
          <ControlButton
            onClick={() => step(ply + 1)}
            disabled={atEnd}
            aria-label="Next move"
          >
            <TbPlayerTrackNextFilled size={18} />
          </ControlButton>
          <ControlButton
            onClick={() => step(total)}
            disabled={atEnd}
            aria-label="Last move"
          >
            <TbPlayerSkipForwardFilled size={18} />
          </ControlButton>
          <ControlButton
            onClick={() =>
              setOrientation((value) => (value === 'white' ? 'black' : 'white'))
            }
            aria-label="Flip board"
          >
            <TbRepeat size={18} />
          </ControlButton>
        </Controls>
      </BoardColumn>

      <Side>
        <Summary>
          <strong>
            {game.Result} · {game.Termination}
          </strong>
          {game.opening && <span>{game.opening}</span>}
        </Summary>

        <MoveList ref={moveList} aria-label="Moves">
          {replay.moves.map((move, index) => {
            const active = index + 1 === ply
            return (
              <li key={index} style={{ display: 'contents' }}>
                {move.color === 'w' && (
                  <MoveNumber as="span">{index / 2 + 1}.</MoveNumber>
                )}
                {/* A game that starts with Black to move (rare: set-up
                    positions) leaves White's first cell empty. */}
                {index === 0 && move.color === 'b' && (
                  <>
                    <MoveNumber as="span">1.</MoveNumber>
                    <span />
                  </>
                )}
                <MoveButton
                  ref={active ? activeMove : undefined}
                  $active={active}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => step(index + 1)}
                >
                  {move.san}
                </MoveButton>
              </li>
            )
          })}
        </MoveList>

        {siteLink}
      </Side>
    </Layout>
  )
}

export default GameViewer
