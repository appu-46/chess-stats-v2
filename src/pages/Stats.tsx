import styled from 'styled-components'
import { useParams } from '@tanstack/react-router'
import useStats from '../hooks/useStats'
import Spinner from '../ui/Spinner'

const StyledStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 120rem;
  justify-content: center;
`

function Stats() {
  const { username } = useParams({ from: '/stats/$username' })
  const { data: stats, isPending: isFetchingStats } = useStats(username)

  console.log(stats)
  const {
    chess960_daily = null,
    chess_blitz = null,
    chess_bullet = null,
    chess_daily = null,
    chess_rapid = null,
    puzzle_rush = null,
    tactics = null,
    fide = null,
  } = stats ?? {}

  console.log(
    chess960_daily,
    chess_blitz,
    chess_bullet,
    chess_daily,
    chess_rapid,
    puzzle_rush,
    tactics,
    fide,
  )

  if (isFetchingStats) return <Spinner size="large" />

  return <StyledStats>{username}'s stats</StyledStats>
}

export default Stats
