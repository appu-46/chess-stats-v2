// One quiet line on a favourite's card: their rating in the time control
// they play most, e.g. "⚡ 3482 blitz". Loads once the card scrolls into
// view, so a long list doesn't fetch every player up front.
import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { useInViewport } from '@mantine/hooks'
import useCurrentRatings from '../hooks/useCurrentRatings'
import { getTimeControls } from '../helpers/timeControls'
import { Pulse } from './DashboardSkeleton'
import type { Platform } from '../helpers/platform'

const Line = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 1.1rem;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;

  svg {
    flex-shrink: 0;
  }
`

const Rating = styled.span`
  font-weight: 700;
`

const Muted = styled.span`
  opacity: 0.6;
`

function MainRating({
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

  const { data, isPending, isError } = useCurrentRatings(
    username,
    platform,
    seen,
  )

  // Most games played; the platform's tab order breaks a tie.
  let main: { timeClass: string; rating: number; games: number } | null = null
  for (const { timeClass } of getTimeControls(platform)) {
    const entry = data?.[timeClass]
    if (entry && (!main || entry.games > main.games)) {
      main = { timeClass, ...entry }
    }
  }
  const control = getTimeControls(platform).find(
    ({ timeClass }) => timeClass === main?.timeClass,
  )

  // Nothing to show (an error, or no rated games): the line just isn't
  // there, rather than a message on every card.
  if (isError || (!isPending && !main)) return <div ref={ref} />

  return (
    <Line ref={ref}>
      {isPending || !main || !control ? (
        <Pulse $w="6rem" $h="0.9rem" />
      ) : (
        <>
          <control.icon size={12} color={control.color} aria-hidden />
          <Rating>{main.rating}</Rating>
          <Muted>{control.label.toLowerCase()}</Muted>
        </>
      )}
    </Line>
  )
}

export default MainRating
