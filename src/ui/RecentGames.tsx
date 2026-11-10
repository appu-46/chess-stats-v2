// The profile's "Recent games": the player's newest games as compact rows,
// each opening the game in the viewer. Loads on its own, so the rest of the
// profile doesn't wait for it.
import styled, { css } from 'styled-components'
import { TbPlayerPlay } from 'react-icons/tb'
import { useState } from 'react'
import useLatestGames from '../hooks/useLatestGames'
import { newestGames } from '../helpers/newestGames'
import { formatTimeControl, shortTermination } from '../helpers/gameFormat'
import { formatDate, formatLastActive } from '../helpers/DateFormat'
import {
  RESULT_COLORS,
  RESULT_LABELS,
  RatingChangeBadge,
  RatingGapBadge,
  ResultIcon,
  ResultPill,
  SideDot,
  UpsetTag,
  ratingGap,
} from './GameResult'
import { Pulse } from './DashboardSkeleton'
import { listHeaderStyles } from './listHeaderStyles'
import GameViewerModal, { opensViewer } from './GameViewerModal'
import type { Result } from './GameResult'
import type { Platform } from '../helpers/platform'
import type { TransformedGame } from '../helpers/transformGame'

const SHOWN = 8
// A couple spare, in case a game can't be parsed. The share card asks for
// the same count, so the two share one cached request.
export const RECENT_GAMES_FETCHED = SHOWN + 2

// Shared by the header and the rows so their columns always line up: Time
// drops out at mid widths, and phones keep only result + opponent.
const columns = css`
  display: grid;
  grid-template-columns:
    6.5rem minmax(0, 16rem) minmax(0, 1fr)
    5.75rem 4.5rem 6.5rem 1rem;
  align-items: center;
  gap: 1rem;
  padding: 0.55rem 0.85rem;

  @media (max-width: 1100px) {
    grid-template-columns:
      6.5rem minmax(0, 1fr) minmax(0, 1fr)
      5.75rem 6rem 1rem;

    & > [data-column='time'] {
      display: none;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 5.5rem minmax(0, 1fr) 1rem;
    gap: 0.75rem;

    & > [data-column='opening'],
    & > [data-column='rating'],
    & > [data-column='ended'] {
      display: none;
    }
  }
`

const HeaderRow = styled.div`
  ${columns}
  ${listHeaderStyles}

  /* Phone rows fold opening, time and age into one line: no columns to
     label. */
  @media (max-width: 768px) {
    display: none;
  }
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`

const Row = styled.a<{ $result: Result }>`
  ${columns}
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
  box-shadow: inset 3px 0 0 ${({ $result }) => RESULT_COLORS[$result]};
  background: color-mix(
    in srgb,
    ${({ $result }) => RESULT_COLORS[$result]} 5%,
    transparent
  );

  &:hover,
  &:focus-visible {
    background: color-mix(
      in srgb,
      ${({ $result }) => RESULT_COLORS[$result]} 12%,
      transparent
    );
  }
`

// The result with how the game ended under it ("Win" over "Resignation").
const RowResultPill = styled(ResultPill)`
  justify-self: stretch;

  small {
    max-width: 100%;
    text-align: center;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  @media (max-width: 768px) {
    padding: 0.25rem 0.3rem;
  }
`

// The player's rating after the game, and the points it moved by.
const RatingLine = styled.span`
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-variant-numeric: tabular-nums;
`

const Cell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`

const Ellipsis = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Opponent = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  font-size: 0.92rem;
  font-weight: 600;
`

const Muted = styled.span`
  font-size: 0.78rem;
  opacity: 0.65;
  font-variant-numeric: tabular-nums;
`

const MutedEllipsis = styled(Muted)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

// Phones fold age, time control and opening under the opponent, opening
// last so a long name is what gets cut short.
const MobileMeta = styled(MutedEllipsis)`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`

const OpenIcon = styled(TbPlayerPlay)`
  opacity: 0.35;
  justify-self: end;

  ${Row}:hover &,
  ${Row}:focus-visible & {
    opacity: 0.9;
  }
`

const Message = styled.p`
  margin: 0;
  padding: 1.25rem 0.5rem;
  opacity: 0.6;
`

function RecentGames({
  username,
  platform,
}: {
  username: string
  platform: Platform
}) {
  const [viewedGame, setViewedGame] = useState<TransformedGame | null>(null)
  const { games, isPending, error } = useLatestGames(
    username,
    RECENT_GAMES_FETCHED,
    platform,
  )
  if (error) return <Message>Couldn't load recent games.</Message>

  if (isPending) {
    return (
      <List aria-busy="true" aria-label="Loading recent games">
        {Array.from({ length: 5 }, (_, i) => (
          <Pulse key={i} $h="2.9rem" $radius="10px" />
        ))}
      </List>
    )
  }

  const lowerUsername = username.toLowerCase()
  const recent = newestGames(games ?? [], lowerUsername, platform, SHOWN)
  if (recent.length === 0) return <Message>No games played yet.</Message>

  return (
    <List>
      <HeaderRow aria-hidden>
        <span>Result</span>
        <span>Opponent</span>
        <span data-column="opening">Opening</span>
        <span data-column="rating">Rating</span>
        <span data-column="time">Time</span>
        <span data-column="ended">Played</span>
        <span />
      </HeaderRow>
      {recent.map((game) => {
        const result = game.resultForPlayer as Result
        const isWhite = game.whitePlayer.toLowerCase() === lowerUsername
        const opponent = isWhite ? game.blackPlayer : game.whitePlayer
        const opponentRating = isWhite ? game.BlackElo : game.WhiteElo
        const timeControl = formatTimeControl(game.TimeControl)
        const ended = formatLastActive(game.endTime)
        const reason = shortTermination(game.Termination)
        const ownRating = isWhite ? game.WhiteElo : game.BlackElo
        const { gap, showGap, isUpset } = ratingGap(
          ownRating,
          opponentRating,
          result,
        )
        const change = game.ratingChange
        const changeText =
          change === null
            ? null
            : change > 0
              ? `+${change}`
              : change < 0
                ? `−${-change}`
                : '±0'

        return (
          <Row
            key={game.url}
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            $result={result}
            // A click replays the game here; the link is still there for
            // opening it on the site in a new tab.
            onClick={(event) => {
              if (opensViewer(event)) setViewedGame(game)
            }}
            aria-label={`${RESULT_LABELS[result]} against ${opponent}, ${reason.toLowerCase()}, ${ended}${isUpset ? ', an upset' : ''}. Replay the game.`}
          >
            <RowResultPill $result={result}>
              <span>
                <ResultIcon result={result} />
                {RESULT_LABELS[result]}
              </span>
              <small title={game.Result}>{reason}</small>
            </RowResultPill>

            <Cell>
              <Opponent>
                <SideDot
                  $side={isWhite ? 'black' : 'white'}
                  title={isWhite ? 'Opponent had Black' : 'Opponent had White'}
                />
                <Ellipsis>{opponent}</Ellipsis>
                <Muted>{opponentRating}</Muted>
                {showGap && <RatingGapBadge gap={gap} />}
                {isUpset && <UpsetTag $result={result}>Upset</UpsetTag>}
              </Opponent>
              <MobileMeta>
                {[changeText, ended, timeControl, game.opening]
                  .filter(Boolean)
                  .join(' · ')}
              </MobileMeta>
            </Cell>

            <Cell data-column="opening">
              <MutedEllipsis title={game.opening ?? undefined}>
                {game.opening ?? '—'}
              </MutedEllipsis>
            </Cell>

            <Cell data-column="rating">
              <RatingLine>
                <span>{ownRating || '—'}</span>
                {change !== null && <RatingChangeBadge change={change} />}
              </RatingLine>
            </Cell>

            <Cell data-column="time">
              <span>{timeControl}</span>
              <Muted style={{ textTransform: 'capitalize' }}>
                {game.time_class}
              </Muted>
            </Cell>

            <Cell data-column="ended">
              <Muted title={formatDate(game.endTime).formattedDateTime}>
                {ended}
              </Muted>
            </Cell>

            <OpenIcon size={14} aria-hidden />
          </Row>
        )
      })}

      <GameViewerModal
        game={viewedGame}
        username={username}
        platform={platform}
        onClose={() => setViewedGame(null)}
      />
    </List>
  )
}

export default RecentGames
