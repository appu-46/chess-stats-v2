import styled from 'styled-components'
import { useParams } from '@tanstack/react-router'
import { FaCircle, FaGamepad, FaStopwatch, FaSun } from 'react-icons/fa'
import { FaCrown } from 'react-icons/fa6'
import { GiBulletBill } from 'react-icons/gi'
import { SiStackblitz } from 'react-icons/si'
import { IoPieChartSharp } from 'react-icons/io5'
import useStats from '../hooks/useStats'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import { RecordPercentageCalc } from '../helpers/RecordPercentageCalc'
import PieGraph from '../ui/PieGraph'
import StatsBlock from '../ui/StatsBlock'

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
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
  padding: 1rem 3rem 1rem 1rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  -webkit-mask-image: linear-gradient(to right, black 95%, transparent 100%);
  mask-image: linear-gradient(to right, black 95%, transparent 100%);
`
const Percentage = styled.div`
  display: flex;
  flex-direction: column;
`
const TitleMain = styled.h2`
  font-size: 42px;
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
  border: 1px solid rgba(255, 255, 255, 0.45);

  [data-mantine-color-scheme='light'] & {
    border: 1px solid rgba(0, 0, 0, 0.45);
  }
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
  flex-direction: row;
  gap: 0.75rem;
  width: fit-content;
`
const RatingBadge = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: fit-content;
`
const IconRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  padding-left: 1rem;
  justify-content: center;
  gap: 1rem;
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
      color: '#f59e0b',
      icon: <SiStackblitz size={40} color="#f59e0b" />,
    },
    {
      key: 'chess_rapid',
      label: 'Rapid',
      color: '#ef4444',

      icon: <FaStopwatch size={40} color="#ef4444" />,
    },
    {
      key: 'chess_bullet',
      label: 'Bullet',
      color: '#3b82f6',
      icon: <GiBulletBill size={40} color="#3b82f6" />,
    },
    {
      key: 'chess_daily',
      label: 'Daily',
      color: '#22c55e',
      icon: <FaSun size={40} color="#22c55e" />,
    },
  ] as const

  return (
    <StyledContainer>
      <IconRow>
        <IoPieChartSharp size={40} color="#5ee7ff" />
        <TitleMain>{`${playerName}'s Stats`}</TitleMain>
      </IconRow>
      <StyledStats>
        {timeControls.map(({ key, label, color, icon }) => {
          const stat = stats?.[key]
          if (!stat) return null

          const record = stat?.record ? RecordPercentageCalc(stat.record) : null

          return (
            <StatsBlock
              key={key}
              style={{
                border: `2px solid ${color}`,
                // borderBottom: `2px solid ${color}`,
                background: `linear-gradient(183deg,${color}45 0%,transparent 4%)`,
                boxShadow: `0 2px 12px rgba(0, 0, 0, 0.08)`,
              }}
            >
              <TitleBadge>
                {icon}
                <Title>{`${label}`}</Title>
              </TitleBadge>
              <RatingBadge>
                <Title style={{ fontSize: '3rem', fontWeight: 900 }}>
                  {stat?.last?.rating}
                </Title>
                <span>Current Rating</span>
              </RatingBadge>
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
