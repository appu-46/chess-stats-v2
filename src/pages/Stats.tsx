import styled from 'styled-components'
import { useParams } from '@tanstack/react-router'
import { FaMedal, FaStopwatch, FaSun } from 'react-icons/fa'
import { GiBulletBill } from 'react-icons/gi'
import { SiStackblitz } from 'react-icons/si'
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
  grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
  justify-items: center;
  gap: 1.5rem;
`

const Title = styled.h2`
  font-size: 34px;
  text-align: center;
`
const Divider = styled.div`
  width: 80%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const TitleBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 15rem;
`
const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 13rem;
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
    { key: 'chess_rapid', label: 'Rapid', icon: <FaStopwatch size={35} /> },
    { key: 'chess_blitz', label: 'Blitz', icon: <SiStackblitz size={35} /> },
    { key: 'chess_bullet', label: 'Bullet', icon: <GiBulletBill size={35} /> },
    { key: 'chess_daily', label: 'Daily', icon: <FaSun size={35} /> },
  ] as const

  return (
    <StyledContainer>
      <Title>{`${playerName}'s Stats`}</Title>

      <StyledStats>
        {timeControls.map(({ key, label, icon }) => {
          const stat = stats?.[key]
          if (!stat) return null

          const record = stat?.record ? RecordPercentageCalc(stat.record) : null

          return (
            <StatsBlock key={key}>
              <TitleBadge>
                {icon}
                <Title>{`${label} Rating:`}</Title>
              </TitleBadge>
              <PieGraph record={record} />
              <Divider />
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
