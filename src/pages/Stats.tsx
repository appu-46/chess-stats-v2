import styled from 'styled-components'
import { useParams } from '@tanstack/react-router'
import { FaCircle, FaGamepad, FaStopwatch, FaSun } from 'react-icons/fa'
import { FaCrown } from 'react-icons/fa6'
import { GiBulletBill } from 'react-icons/gi'
import { SiStackblitz } from 'react-icons/si'
import useStats from '../hooks/useStats'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import { RecordPercentageCalc } from '../helpers/RecordPercentageCalc'
import PieGraph from '../ui/PieGraph'
import StatsBlock from '../ui/StatsBlock'

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
`
const StatRow = styled.div`
  display: flex;
  transition: all 0.2s ease;
  justify-content: start;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`

const MetaColumns = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledStats = styled.div`
  display: flex;
  align-items: stretch;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
`
const Percentage = styled.div`
  display: flex;
  flex-direction: column;
`
const TitleMain = styled.h2`
  font-size: 42px;
  text-align: center;
  font-weight: 700;
`
const Title = styled.h2`
  font-size: 28px;
  text-align: center;
  font-weight: 500;
`
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`
const StatTitle = styled.div`
  font-size: 1rem;
  font-weight: 400;
`

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
`

const TitleBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: fit-content;
`

const Piesection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: fit-content;
`
const Badge = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1rem;
`
const Statfooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
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
    {
      key: 'chess_blitz',
      label: 'Blitz',
      color: '#e3bd37',
      icon: <SiStackblitz size={40} color="#e3bd37" />,
    },
    {
      key: 'chess_rapid',
      label: 'Rapid',
      color: '#fa6d4b',

      icon: <FaStopwatch size={40} color="#fa6d4b" />,
    },
    {
      key: 'chess_bullet',
      label: 'Bullet',
      color: '#5d9bf0',
      icon: <GiBulletBill size={40} color="#5d9bf0" />,
    },
    {
      key: 'chess_daily',
      label: 'Daily',
      color: '#f7a233',
      icon: <FaSun size={40} color="#f7a233" />,
    },
  ] as const

  return (
    <StyledContainer>
      <TitleMain>{`${playerName}'s Stats`}</TitleMain>
      <StyledStats>
        {timeControls.map(({ key, label, color, icon }) => {
          const stat = stats?.[key]
          if (!stat) return null

          const record = stat?.record ? RecordPercentageCalc(stat.record) : null

          return (
            <StatsBlock
              key={key}
              style={{
                borderTop: `2px solid ${color}`,
                background: `linear-gradient(183deg,${color}45 0%,rgba(255, 255, 255, 0.03) 4%)`,
              }}
            >
              <TitleBadge>
                {icon}
                <Title>{`${label}`}</Title>
              </TitleBadge>
              <TitleBadge style={{ fontSize: '3rem', fontWeight: 900 }}>
                {stat?.last?.rating}
              </TitleBadge>
              <TitleBadge>Current Rating</TitleBadge>
              <Piesection>
                <PieGraph record={record} />
                <Percentage>
                  <StatRow>
                    <FaCircle size={32} color="#2ecc71" />
                    <MetaColumns>
                      <StatValue>{record?.percentageWins}%</StatValue>
                      <StatTitle>Win</StatTitle>
                    </MetaColumns>
                  </StatRow>
                  <StatRow>
                    <FaCircle size={32} color="#e74c3c" />
                    <MetaColumns>
                      <StatValue>{record?.percentageLosses}%</StatValue>
                      <StatTitle>Loss</StatTitle>
                    </MetaColumns>
                  </StatRow>
                  <StatRow>
                    <FaCircle size={32} color="#f1c40f" />
                    <MetaColumns>
                      <StatValue>{record?.percentageDraws}%</StatValue>
                      <StatTitle>Draw</StatTitle>
                    </MetaColumns>
                  </StatRow>
                </Percentage>
              </Piesection>
              <Divider />
              <Statfooter>
                <Badge>
                  <FaCrown color="#5fd2e6" size={26} />
                  <MetaColumns>
                    <p> Best Rating </p>
                    <StatTitle style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                      {stat?.best?.rating}
                    </StatTitle>
                  </MetaColumns>
                </Badge>
                <Badge>
                  <FaGamepad color="#5fd2e6" size={26} />
                  <MetaColumns>
                    <p>Games Played</p>
                    <TitleBadge
                      style={{ fontSize: '1.25rem', fontWeight: 600 }}
                    >
                      {record?.totalGames}
                    </TitleBadge>
                  </MetaColumns>
                </Badge>
              </Statfooter>
            </StatsBlock>
          )
        })}
      </StyledStats>
    </StyledContainer>
  )
}

export default Stats
