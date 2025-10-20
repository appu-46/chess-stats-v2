import styled from 'styled-components'
import { useParams } from '@tanstack/react-router'
import { FaMedal } from 'react-icons/fa'
import { LuRefreshCw } from 'react-icons/lu'
import useStats from '../hooks/useStats'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import { RecordPercentageCalc } from '../helpers/RecordPercentageCalc'
import PieGraph from '../ui/PieGraph'
import StatsBlock from '../ui/StatsBlock'

const StyledContainer = styled.div`
  display: grid;
  grid-gap: 0.25rem;
  align-items: center;
  min-width: 50rem;
  justify-items: center;
  justify-content: center;
`

const StyledStats = styled.div`
  display: grid;
  grid-template-rows: auto;
  align-items: center;
  max-width: 100rem;
  justify-content: center;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  justify-items: center;
  gap: 1rem;
`

const Title = styled.h2`
  font-size: 34px;
  text-align: center;
`

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

function Stats() {
  const { username } = useParams({ from: '/stats/$username' })
  const {
    data: stats,
    isPending: isFetchingStats,
    error: errorStats,
  } = useStats(username)
  const { data: profile, isPending: isFetchingProfile } = useProfile(username)

  if (errorStats) return <p>{`${errorStats.message}`}</p>
  if (isFetchingStats || isFetchingProfile) return <Spinner size="large" />

  const { name: playerName = '' } = profile ?? {}

  // define all time controls dynamically
  const timeControls = [
    { key: 'chess_rapid', label: 'Rapid' },
    { key: 'chess_blitz', label: 'Blitz' },
    { key: 'chess_bullet', label: 'Bullet' },
    { key: 'chess_daily', label: 'Daily' },
  ] as const

  return (
    <StyledContainer>
      <Title>{`${playerName}'s Stats`}</Title>

      <StyledStats>
        {timeControls.map(({ key, label }) => {
          const stat = stats?.[key]
          if (!stat) return null

          const record = stat?.record ? RecordPercentageCalc(stat.record) : null

          return (
            <StatsBlock key={key}>
              <Title>{`${label} Rating:`}</Title>
              <PieGraph record={record} />
              <Badge>
                <FaMedal /> Best ELO - {stat?.best?.rating}
              </Badge>
              <Badge>
                <LuRefreshCw /> Latest ELO - {stat?.last?.rating}
              </Badge>
            </StatsBlock>
          )
        })}
      </StyledStats>
    </StyledContainer>
  )
}

export default Stats
