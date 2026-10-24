import styled from 'styled-components'
import { useParams } from '@tanstack/react-router'
import { FaGamepad } from 'react-icons/fa'
import { FaCrown } from 'react-icons/fa6'
import { IoStatsChart } from 'react-icons/io5'
import useStats from '../hooks/useStats'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import { RecordPercentageCalc } from '../helpers/RecordPercentageCalc'
import PieGraph from '../ui/PieGraph'
import StatsBlock from '../ui/StatsBlock'
import usePlatform from '../hooks/usePlatform'
import { getTimeControls } from '../helpers/timeControls'
import PageHeader from '../ui/PageHeader'
import PageError from '../ui/PageError'

// As wide as the card grid and centred, so the header starts at the
// cards' left edge whether they sit two or four across.
const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
`
const MetaColumns = styled.div`
  display: flex;
  flex-direction: column;
`

// Cards have a fixed, compact width (the donut + legend need ~21rem) and
// sit centred instead of stretching across the page. Four cards are a grid:
// 4 across only where they fit, 2x2 otherwise (never 3 + a lone card). Any
// other count (1-3, or 5 on lichess) is a centred row that wraps.
const CARD_WIDTH = '23rem'

const StyledStats = styled.div<{ $count: number }>`
  display: ${({ $count }) => ($count === 4 ? 'grid' : 'flex')};
  grid-template-columns: repeat(4, ${CARD_WIDTH});
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 2rem;

  & > * {
    flex: 0 1 ${CARD_WIDTH};
  }

  @media (max-width: 1780px) {
    grid-template-columns: repeat(2, ${CARD_WIDTH});
  }

  @media (max-width: 1000px) {
    grid-template-columns: minmax(0, ${CARD_WIDTH});
  }

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
    padding: 0.5rem 0;

    & > * {
      flex-basis: 100%;
    }
  }
`
// Same side padding as the cards below, so the header lines up with them.
const HeaderSlot = styled.div`
  padding: 0.5rem 2rem 0;

  @media (max-width: 768px) {
    padding: 0.5rem 0 0;
  }
`
const Title = styled.h2`
  font-size: 28px;
  text-align: center;
  font-weight: 500;
`
const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`
const LegendItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`
const LegendLabel = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  opacity: 0.65;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`
const LegendPct = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`
const LegendCount = styled.div`
  font-size: 0.75rem;
  opacity: 0.5;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);

  [data-mantine-color-scheme='light'] & {
    background: rgba(0, 0, 0, 0.1);
  }
`
const StatTitle = styled.div`
  font-size: 0.85rem;
  opacity: 0.6;
`

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
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
  flex-direction: column;
  gap: 0.15rem;
`
const CurrentRating = styled.div`
  font-size: 3.25rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`
const Piesection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
`
const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`
const Statfooter = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`

function Stats() {
  const { username } = useParams({ from: '/stats/$username' })
  const platform = usePlatform()
  const {
    data: stats,
    isPending: isFetchingStats,
    error: errorStats,
  } = useStats(username, platform)
  const { data: profile, isPending: isFetchingProfile } = useProfile(
    username,
    platform,
  )

  if (errorStats) return <PageError error={errorStats} />
  if (isFetchingStats || isFetchingProfile) return <Spinner size="large" />

  const timeControls = getTimeControls(platform)
  const cardCount = timeControls.filter(
    ({ timeClass }) => stats?.[timeClass],
  ).length

  return (
    <StyledContainer>
      <HeaderSlot>
        <PageHeader
          icon={IoStatsChart}
          section="Stats"
          username={username}
          platform={platform}
          profile={profile}
          subtitle="Ratings and results by time control"
        />
      </HeaderSlot>
      <StyledStats $count={cardCount}>
        {timeControls.map(({ timeClass, label, color, icon: Icon }) => {
          const stat = stats?.[timeClass]
          if (!stat) return null

          const record = RecordPercentageCalc(stat.record)

          return (
            <StatsBlock
              key={timeClass}
              style={{
                border: `2px solid ${color}`,
                // borderBottom: `2px solid ${color}`,
                background: `linear-gradient(183deg,${color}45 0%,transparent 4%)`,
                boxShadow: `0 2px 12px rgba(0, 0, 0, 0.08)`,
              }}
            >
              <TitleBadge>
                <Icon size={32} color={color} />
                <Title>{label}</Title>
              </TitleBadge>
              <RatingBadge>
                <CurrentRating>{stat.current ?? '—'}</CurrentRating>
                <StatTitle>Current rating</StatTitle>
              </RatingBadge>
              <Piesection>
                <PieGraph record={record} />
                <Legend>
                  {/* Win rate is shown in the centre of the donut. */}
                  {[
                    {
                      label: 'Loss',
                      color: '#e74c3c',
                      pct: record.percentageLosses,
                      count: stat.record.loss,
                    },
                    {
                      label: 'Draw',
                      color: '#f1c40f',
                      pct: record.percentageDraws,
                      count: stat.record.draw,
                    },
                  ].map((part) => (
                    <LegendItem key={part.label}>
                      <LegendLabel $color={part.color}>
                        {part.label}
                      </LegendLabel>
                      <LegendPct>{part.pct.toFixed(1)}%</LegendPct>
                      <LegendCount>
                        {part.count.toLocaleString('en-IN')}
                      </LegendCount>
                    </LegendItem>
                  ))}
                </Legend>
              </Piesection>
              <Divider />
              <Statfooter>
                <Badge>
                  <FaCrown size={20} style={{ opacity: 0.7 }} />
                  <MetaColumns>
                    <StatTitle>Best rating</StatTitle>
                    <StatValue>{stat.best?.rating ?? '—'}</StatValue>
                  </MetaColumns>
                </Badge>
                <Badge>
                  <FaGamepad size={20} style={{ opacity: 0.7 }} />
                  <MetaColumns>
                    <StatTitle>Games played</StatTitle>
                    <StatValue>
                      {record.totalGames.toLocaleString('en-IN')}
                    </StatValue>
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
