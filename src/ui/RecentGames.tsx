// The profile's "Recent games": the player's newest games as compact rows,
// each opening the game on its site. Loads on its own, so the rest of the
// profile doesn't wait for it.
import styled, { css } from 'styled-components'
import { FiExternalLink } from 'react-icons/fi'
import useLatestGames from '../hooks/useLatestGames'
import { newestGames } from '../helpers/newestGames'
import { formatTimeControl } from '../helpers/gameFormat'
import { formatDate, formatLastActive } from '../helpers/DateFormat'
import { PLATFORM_LABELS } from '../helpers/platform'
import {
  RESULT_COLORS,
  RESULT_LABELS,
  ResultIcon,
  ResultPill,
  SideDot,
} from './GameResult'
import { Pulse } from './DashboardSkeleton'
import type { Result } from './GameResult'
import type { Platform } from '../helpers/platform'

const SHOWN = 8
// A couple spare, in case a game can't be parsed. The share card asks for
// the same count, so the two share one cached request.
export const RECENT_GAMES_FETCHED = SHOWN + 2

// Shared by the header and the rows so their columns always line up: Time
// drops out at mid widths, and phones keep only result + opponent.
const columns = css`
  display: grid;
  grid-template-columns:
    5.25rem minmax(0, 15rem) minmax(0, 1fr)
    4.5rem 6.5rem 1rem;
  align-items: center;
  gap: 1rem;
  padding: 0.55rem 0.85rem;

  @media (max-width: 1100px) {
    grid-template-columns: 5.25rem minmax(0, 1fr) minmax(0, 1fr) 6rem 1rem;

    & > [data-column='time'] {
      display: none;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 4.75rem minmax(0, 1fr) 1rem;
    gap: 0.75rem;

    & > [data-column='opening'],
    & > [data-column='ended'] {
      display: none;
    }
  }
`

const HeaderRow = styled.div`
  ${columns}
  padding-top: 0;
  padding-bottom: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;

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

const OpenIcon = styled(FiExternalLink)`
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

        return (
          <Row
            key={game.url}
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            $result={result}
            aria-label={`${RESULT_LABELS[result]} against ${opponent}, ${ended}. Opens on ${PLATFORM_LABELS[platform]}.`}
          >
            <ResultPill $result={result}>
              <span>
                <ResultIcon result={result} />
                {RESULT_LABELS[result]}
              </span>
            </ResultPill>

            <Cell>
              <Opponent>
                <SideDot
                  $side={isWhite ? 'black' : 'white'}
                  title={isWhite ? 'Opponent had Black' : 'Opponent had White'}
                />
                <Ellipsis>{opponent}</Ellipsis>
                <Muted>{opponentRating}</Muted>
              </Opponent>
              <MobileMeta>
                {[ended, timeControl, game.opening].filter(Boolean).join(' · ')}
              </MobileMeta>
            </Cell>

            <Cell data-column="opening">
              <MutedEllipsis title={game.opening ?? undefined}>
                {game.opening ?? '—'}
              </MutedEllipsis>
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
    </List>
  )
}

export default RecentGames
