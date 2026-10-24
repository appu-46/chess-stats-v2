// The middle of a favourite's card: their current ratings, and how their
// last few games went. Loads once the card scrolls into view, so a long
// list doesn't fetch every player up front.
import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { Tooltip } from '@mantine/core'
import { useInViewport } from '@mantine/hooks'
import usePlayerSnapshot from '../hooks/usePlayerSnapshot'
import { getTimeControls } from '../helpers/timeControls'
import { newestGames } from '../helpers/newestGames'
import { formatLastActive } from '../helpers/DateFormat'
import { RESULT_COLORS, RESULT_LABELS } from './GameResult'
import { RECENT_GAMES_FETCHED } from './RecentGames'
import { Pulse } from './DashboardSkeleton'
import type { Result } from './GameResult'
import type { Platform } from '../helpers/platform'

// At most this many ratings fit on the card's line.
const SHOWN_RATINGS = 3
const FORM_GAMES = 5

// Two labelled lines: ratings, then the last few results.
const Wrapper = styled.dl`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.55rem 0.9rem;
  margin: 0;
`

const Label = styled.dt`
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.5;
`

const Value = styled.dd`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  min-height: 1.6rem;
  margin: 0;
`

const RatingChip = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  background: color-mix(in srgb, ${({ $color }) => $color} 11%, transparent);

  svg {
    flex-shrink: 0;
    color: ${({ $color }) => $color};
  }
`

const FormSquare = styled.span<{ $result: Result }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 4px;
  font-size: 0.62rem;
  font-weight: 800;
  color: ${({ $result }) => RESULT_COLORS[$result]};
  background: color-mix(
    in srgb,
    ${({ $result }) => RESULT_COLORS[$result]} 18%,
    transparent
  );

  && {
    color: ${({ $result }) => RESULT_COLORS[$result]};
  }
`

const Note = styled.span`
  font-size: 0.8rem;
  opacity: 0.5;
`

function PlayerSnapshot({
  username,
  platform,
}: {
  username: string
  platform: Platform
}) {
  const { ref, inViewport } = useInViewport()
  // Latched: scrolling a card back out of view shouldn't drop its data.
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (inViewport) setSeen(true)
  }, [inViewport])

  const { ratings, games } = usePlayerSnapshot(
    username,
    platform,
    RECENT_GAMES_FETCHED,
    seen,
  )

  const shownRatings = getTimeControls(platform)
    .filter(({ timeClass }) => ratings.data?.[timeClass] != null)
    .slice(0, SHOWN_RATINGS)

  // Oldest on the left, so the row reads like a timeline.
  const form = games.data
    ? newestGames(
        games.data,
        username.toLowerCase(),
        platform,
        FORM_GAMES,
      ).reverse()
    : []

  return (
    <Wrapper ref={ref}>
      <Label>Rating</Label>
      <Value>
        {ratings.isPending ? (
          <Pulse $w="9rem" $h="1.6rem" $radius="7px" />
        ) : ratings.isError ? (
          <Note>Ratings unavailable</Note>
        ) : shownRatings.length === 0 ? (
          <Note>No rated games</Note>
        ) : (
          shownRatings.map(({ timeClass, label, color, icon: Icon }) => (
            <Tooltip key={timeClass} label={label} openDelay={200}>
              <RatingChip $color={color}>
                <Icon size={12} aria-hidden />
                <span aria-label={`${label} rating`}>
                  {ratings.data[timeClass]}
                </span>
              </RatingChip>
            </Tooltip>
          ))
        )}
      </Value>

      <Label>Last {FORM_GAMES}</Label>
      <Value
        style={{ gap: '0.25rem' }}
        aria-label={
          form.length ? `Last ${form.length} games, oldest first` : undefined
        }
      >
        {games.isPending ? (
          <Pulse $w="6.5rem" $h="1.15rem" $radius="4px" />
        ) : games.isError ? (
          <Note>Games unavailable</Note>
        ) : form.length === 0 ? (
          <Note>No recent games</Note>
        ) : (
          form.map((game) => {
            const result = game.resultForPlayer as Result
            const isWhite =
              game.whitePlayer.toLowerCase() === username.toLowerCase()
            const opponent = isWhite ? game.blackPlayer : game.whitePlayer
            return (
              <Tooltip
                key={game.url}
                label={`${RESULT_LABELS[result]} vs ${opponent} · ${formatLastActive(game.endTime)}`}
                openDelay={150}
              >
                <FormSquare $result={result}>
                  {RESULT_LABELS[result].charAt(0)}
                </FormSquare>
              </Tooltip>
            )
          })
        )}
      </Value>
    </Wrapper>
  )
}

export default PlayerSnapshot
