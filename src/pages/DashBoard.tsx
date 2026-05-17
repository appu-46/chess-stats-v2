import styled from 'styled-components'
import { FaGamepad, FaStopwatch, FaSun } from 'react-icons/fa'
import { FaCrown } from 'react-icons/fa6'
import { SiStackblitz } from 'react-icons/si'
import { GiBulletBill } from 'react-icons/gi'
import { IoMdTrendingUp } from 'react-icons/io'
import { MdCalendarMonth } from 'react-icons/md'
import { useParams, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import useProfile from '../hooks/useProfile'
import Spinner from '../ui/Spinner'
import useGames30days from '../hooks/useGames30days'
import useGames from '../hooks/useGames'
import { transformGames } from '../helpers/TransformGames'
import { gamesDateWise } from '../helpers/gamesDateWise'
import AreaGraph from '../ui/AreaGraph'

// ── Styled Components ───────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
`

export const TitleMain = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  font-weight: 700;
  margin: 0;
`

const Subtitle = styled.p`
  text-align: center;
  opacity: 0.5;
  font-size: 0.95rem;
  margin: 0;
`

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

// ── Tabs ────────────────────────────────────────────────────────────

const TabRow = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  padding: 0.4rem;
  width: fit-content;
`

const Tab = styled.button<{ $active: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  border: ${({ $active, $color }) =>
    $active ? `1.5px solid ${$color}` : '1.5px solid transparent'};
  background: ${({ $active, $color }) =>
    $active ? `${$color}18` : 'transparent'};
  color: ${({ $active, $color }) => ($active ? $color : 'inherit')};
  font-size: 1rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${({ $active }) => ($active ? 1 : 0.6)};

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.06);
  }
`

// ── Stat Cards ──────────────────────────────────────────────────────

const StatCardsRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`

const StatCard = styled.div`
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`

const StatCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`

const StatCardLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.5;
  font-weight: 400;
`

const StatCardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
`

const StatCardSub = styled.div`
  font-size: 0.75rem;
  opacity: 0.5;
`

// ── Graph Card ──────────────────────────────────────────────────────

const GraphCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const GraphHeader = styled.div`
  display: flex;
  justify-content: flex-end;
`

const RangeRow = styled.div`
  display: flex;
  gap: 0.25rem;
`

const RangeBtn = styled.button<{ $active: boolean; $color: string }>`
  padding: 0.3rem 0.75rem;
  border-radius: 50px;
  border: ${({ $active, $color }) =>
    $active ? `1.5px solid ${$color}` : '1.5px solid transparent'};
  background: ${({ $active, $color }) =>
    $active ? `${$color}18` : 'transparent'};
  color: ${({ $active, $color }) => ($active ? $color : 'inherit')};
  font-size: 0.85rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
  }
`

// ── Time Controls Config ─────────────────────────────────────────────

const timeControls = [
  {
    key: 'chess_blitz' as const,
    label: 'Blitz',
    dataKey: 'blitzGames' as const,
    color: '#e3bd37',
    icon: SiStackblitz,
  },
  {
    key: 'chess_rapid' as const,
    label: 'Rapid',
    dataKey: 'rapidGames' as const,
    color: '#fa6d4b',
    icon: FaStopwatch,
  },
  {
    key: 'chess_bullet' as const,
    label: 'Bullet',
    dataKey: 'bulletGames' as const,
    color: '#5d9bf0',
    icon: GiBulletBill,
  },
  {
    key: 'chess_daily' as const,
    label: 'Daily',
    dataKey: 'dailyGames' as const,
    color: '#f7a233',
    icon: FaSun,
  },
]

const ranges = ['7D', '30D', '90D', '1Y', 'All']

function filterByRange(
  data: Record<string, Array<any>>,
  range: string,
): Record<string, Array<any>> {
  if (range === 'All') return data
  const days =
    range === '7D' ? 7 : range === '30D' ? 30 : range === '90D' ? 90 : 365
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return Object.fromEntries(
    Object.entries(data).filter(([date]) => new Date(date) >= cutoff),
  )
}

// ── Dashboard Inner ──────────────────────────────────────────────────

function DashboardInner({
  games,
  profile,
  username,
}: {
  games: any
  profile: any
  username: string
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [activeRange, setActiveRange] = useState('30D')

  const playerName = profile?.name ?? username
  const transformedData = transformGames(games, username)

  const allGraphData = {
    blitzGames: gamesDateWise(transformedData.blitzGames),
    rapidGames: gamesDateWise(transformedData.rapidGames),
    bulletGames: gamesDateWise(transformedData.bulletGames),
    dailyGames: gamesDateWise(transformedData.dailyGames),
  }
  console.log(allGraphData)

  const active = timeControls[activeTab]
  const rawData = allGraphData[active.dataKey]
  const filteredData = filterByRange(rawData, activeRange)

  const entries = Object.entries(filteredData)
  const eloValues = entries.map(([, Daygames]) =>
    Number(Daygames.at(-1)?.PlayerELO ?? 0),
  )
  const currentElo = eloValues.at(-1) ?? 0
  const firstElo = eloValues[0] ?? 0
  const change = currentElo - firstElo
  const changePct = firstElo > 0 ? ((change / firstElo) * 100).toFixed(2) : '0'

  // Peak ELO from all data (not filtered)
  const allEntries = Object.entries(rawData)
  const allElos = allEntries.map(([, Daygames]) =>
    Number(Daygames.at(-1)?.PlayerELO ?? 0),
  )
  const peakElo = allElos.length > 0 ? Math.max(...allElos) : 0
  const totalGames = allEntries.reduce(
    (sum, [, Daygames]) => sum + Daygames.length,
    0,
  )

  // Last 30D change
  const last30 = filterByRange(rawData, '30D')
  const last30Entries = Object.entries(last30)
  const last30Elos = last30Entries.map(([, Daygames]) =>
    Number(Daygames.at(-1)?.PlayerELO ?? 0),
  )
  const last30Change =
    last30Elos.length > 1 ? (last30Elos.at(-1) ?? 0) - (last30Elos[0] ?? 0) : 0
  const last30Pct =
    last30Elos[0] > 0 ? ((last30Change / last30Elos[0]) * 100).toFixed(2) : '0'

  const IconComp = active.icon

  return (
    <PageWrapper>
      <TitleSection>
        <TitleMain>{`Games of ${playerName}`}</TitleMain>
        <Subtitle>
          Track your rating performance across different time controls.
        </Subtitle>
      </TitleSection>

      {/* Tabs */}
      <TabRow>
        {timeControls.map(({ label, color, icon: Icon }, i) => (
          <Tab
            key={label}
            $active={activeTab === i}
            $color={color}
            onClick={() => setActiveTab(i)}
          >
            <Icon size={18} />
            {label}
          </Tab>
        ))}
      </TabRow>

      {/* Stat Cards */}
      <StatCardsRow>
        <StatCard>
          <FaCrown size={28} color="#5fd2e6" />
          <StatCardInfo>
            <StatCardLabel>Peak Rating</StatCardLabel>
            <StatCardValue>{peakElo || '—'}</StatCardValue>
          </StatCardInfo>
        </StatCard>

        <StatCard>
          <IoMdTrendingUp size={28} color={active.color} />
          <StatCardInfo>
            <StatCardLabel>Current Rating</StatCardLabel>
            <StatCardValue style={{ color: active.color }}>
              {currentElo || '—'}
            </StatCardValue>
          </StatCardInfo>
        </StatCard>

        <StatCard>
          <IconComp size={28} color={change >= 0 ? '#22c55e' : '#ef4444'} />
          <StatCardInfo>
            <StatCardLabel>Change</StatCardLabel>
            <StatCardValue
              style={{ color: change >= 0 ? '#22c55e' : '#ef4444' }}
            >
              {change >= 0 ? '+' : ''}
              {change || '—'}
            </StatCardValue>
            <StatCardSub>↑ {changePct}%</StatCardSub>
          </StatCardInfo>
        </StatCard>

        <StatCard>
          <FaGamepad size={28} color="#5fd2e6" />
          <StatCardInfo>
            <StatCardLabel>Games Played</StatCardLabel>
            <StatCardValue>
              {totalGames.toLocaleString('en-IN') || '—'}
            </StatCardValue>
          </StatCardInfo>
        </StatCard>

        <StatCard>
          <MdCalendarMonth size={28} color="#a855f7" />
          <StatCardInfo>
            <StatCardLabel>Last 30 Days</StatCardLabel>
            <StatCardValue
              style={{ color: last30Change >= 0 ? '#22c55e' : '#ef4444' }}
            >
              {last30Change >= 0 ? '+' : ''}
              {last30Change || '—'}
            </StatCardValue>
            <StatCardSub>↑ {last30Pct}%</StatCardSub>
          </StatCardInfo>
        </StatCard>
      </StatCardsRow>

      {/* Graph */}
      <GraphCard>
        <GraphHeader>
          <RangeRow>
            {ranges.map((r) => (
              <RangeBtn
                key={r}
                $active={activeRange === r}
                $color={active.color}
                onClick={() => setActiveRange(r)}
              >
                {r}
              </RangeBtn>
            ))}
          </RangeRow>
        </GraphHeader>

        <AreaGraph data={filteredData} color={active.color} />
      </GraphCard>
    </PageWrapper>
  )
}

// ── Main Component ───────────────────────────────────────────────────

function DashBoard() {
  const { username } = useParams({ from: '/dashboard/$username' })
  const { year, month } = useSearch({ from: '/dashboard/$username' })

  const { data: profile, isPending: isFetchingProfile } = useProfile(username)

  if (year && month != null) {
    const {
      data: games,
      isPending: isFetchingGames,
      error: errorGames,
    } = useGames(username, year, month)
    if (isFetchingGames || isFetchingProfile) return <Spinner />
    if (errorGames) return <p>{errorGames.message}</p>
    return (
      <DashboardInner games={games} profile={profile} username={username} />
    )
  }

  const {
    data: games,
    isPending: isFetchingGames,
    error: errorGames,
  } = useGames30days(username)
  if (isFetchingGames || isFetchingProfile) return <Spinner />
  if (errorGames) return <p>{errorGames.message}</p>

  return <DashboardInner games={games} profile={profile} username={username} />
}

export default DashBoard
