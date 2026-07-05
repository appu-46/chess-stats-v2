import styled from 'styled-components'
import { FaGamepad, FaStopwatch, FaSun } from 'react-icons/fa'
import { FaCrown } from 'react-icons/fa6'
import { SiStackblitz } from 'react-icons/si'
import { GiBulletBill } from 'react-icons/gi'
import { IoMdTrendingUp } from 'react-icons/io'
import { MdCalendarMonth } from 'react-icons/md'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import useProfile from '../hooks/useProfile'
import DashboardSkeleton from '../ui/DashboardSkeleton'
import useGamesRecentdays from '../hooks/useGamesRecentdays'
import useGames from '../hooks/useGames'
import { useProgressiveTransform } from '../hooks/useProgressiveTransform'
import AnimatedStatValue from '../ui/AnimatedStatValue'
import { gamesDateWise } from '../helpers/gamesDateWise'
import AreaGraph from '../ui/AreaGraph'

// ── Styled Components ───────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 2rem;

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
  }
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
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50px;
  width: fit-content;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
    /* Fade the right edge as a hint that the row scrolls for more tabs. */
    -webkit-mask-image: linear-gradient(to right, #000 85%, transparent 100%);
    mask-image: linear-gradient(to right, #000 85%, transparent 100%);
  }

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`

const Tab = styled.button<{ $active: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 3.5rem;
  border-radius: 50px;

  @media (max-width: 768px) {
    padding: 0.6rem 1.25rem;
    font-size: 1rem !important;
    flex-shrink: 0;
  }
  border: ${({ $active, $color }) =>
    $active ? `1.5px solid ${$color}` : '1.5px solid transparent'};
  background: ${({ $active }) =>
    $active ? `rgba(0, 0, 0, 0.3);` : 'transparent'};
  color: ${({ $active, $color }) => ($active ? $color : 'inherit')};
  font-size: ${({ $active }) => ($active ? '1.5rem' : '1.25rem')};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1) !important;
  opacity: ${({ $active }) => ($active ? 1 : 0.7)};
  box-shadow: ${({ $active, $color }) =>
    $active ? `inset 0 0 5px ${$color},inset 0 0 10px ${$color}` : 'none'};
  [data-mantine-color-scheme='light'] & {
    background: ${({ $active }) =>
      $active ? `rgba(255, 255, 255, 0.45);` : 'transparent'};
  }
  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.08);
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
  gap: 2rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(187, 247, 208, 0.48);
  border-radius: 12px;
  transition: all 0.2s ease;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(187, 247, 208, 0.48);
    transform: translateY(-2px);
  }
  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(20, 83, 45, 0.48);
  }
`

const StatCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`

const StatCardLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.75;
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
  border: 1px solid rgba(187, 247, 208, 0.48);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(20, 83, 45, 0.48);
  }
`

const GraphHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
`

const YearSelect = styled.select<{ $color: string }>`
  padding: 0.5rem 1rem;
  border-radius: 50px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.3);
  color: inherit;
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  outline: none;
  appearance: none;
  padding-right: 2rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.6)' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
  }

  &:hover {
    border-color: ${({ $color }) => $color};
  }

  option {
    background: #1a1a1a;
    color: inherit;
  }
`

const RangeRow = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 2rem;
  gap: 0.75rem;

  @media (max-width: 768px) {
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
    /* Fade the right edge to hint the range options scroll horizontally. */
    -webkit-mask-image: linear-gradient(to right, #000 85%, transparent 100%);
    mask-image: linear-gradient(to right, #000 85%, transparent 100%);
  }

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
`

const RangeBtn = styled.button<{ $active: boolean; $color: string }>`
  padding: 0.5rem 1.75rem;
  border-radius: 50px;

  @media (max-width: 768px) {
    padding: 0.5rem 1.1rem;
    flex-shrink: 0;
  }
  border: ${({ $active, $color }) =>
    $active ? `1.5px solid ${$color}` : '1.5px solid transparent'};
  background: ${({ $active }) =>
    $active ? `rgba(0, 0, 0, 0.3);` : 'transparent'};
  color: ${({ $active, $color }) => ($active ? $color : 'inherit')};
  font-size: 1rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  transition: all 0.2s ease !important;
  box-shadow: ${({ $active, $color }) =>
    $active ? `inset 0 0 2px ${$color},inset 0 0 8px ${$color}` : 'none'};

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.45);
  }

  &:hover {
    background: rgb(255, 255, 255, 0.08);
    opacity: 1;
  }
`

// ── Time Controls Config ─────────────────────────────────────────────

const timeControls = [
  {
    key: 'chess_blitz' as const,
    label: 'Blitz',
    dataKey: 'blitzGames' as const,
    color: '#f59e0b',
    icon: SiStackblitz,
  },
  {
    key: 'chess_rapid' as const,
    label: 'Rapid',
    dataKey: 'rapidGames' as const,
    color: '#ef4444',
    icon: FaStopwatch,
  },
  {
    key: 'chess_bullet' as const,
    label: 'Bullet',
    dataKey: 'bulletGames' as const,
    color: '#3b82f6',
    icon: GiBulletBill,
  },
  {
    key: 'chess_daily' as const,
    label: 'Daily',
    dataKey: 'dailyGames' as const,
    color: '#22c55e',
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

function filterByYear(
  data: Record<string, Array<any>>,
  year: string,
): Record<string, Array<any>> {
  if (!year) return data
  const prefix = `${year}.`
  return Object.fromEntries(
    Object.entries(data).filter(([date]) => date.startsWith(prefix)),
  )
}

function getAvailableYears(games: Array<any> | undefined): Array<string> {
  if (!games?.length) return []
  const years = new Set<string>()
  for (const game of games) {
    console.log(game?.gameEndDate)
    if (game?.gameEndDate) {
      const year = game.gameEndDate.split('.')[0]
      console.log(year)
      if (year) years.add(year)
    }
  }
  return Array.from(years).sort().reverse()
}

function MonthlyDashboard({
  username,
  year,
  month,
  range,
  profile,
  isFetchingProfile,
}: {
  username: string
  year: string
  month: string
  range: string
  profile: any
  isFetchingProfile: boolean
}) {
  const {
    games,
    isPending: isFetchingGames,
    error,
  } = useGames(username, year, month)

  if (isFetchingGames || isFetchingProfile) return <DashboardSkeleton />
  if (error) return <p>{error.message}</p>

  return (
    <DashboardInner
      games={games}
      profile={profile}
      username={username}
      range={range}
      isMonthlyView={true}
    />
  )
}

function RecentDashboard({
  username,
  range,
  profile,
  isFetchingProfile,
}: {
  username: string
  range: string
  profile: any
  isFetchingProfile: boolean
}) {
  const {
    data: games,
    isPending: isFetchingGames,
    error,
  } = useGamesRecentdays(username, range)

  if (isFetchingGames || isFetchingProfile)
    return (
      <DashboardSkeleton message="If you have played a lot of games, it may take a while to load graphs..." />
    )
  if (error) return <p>{error.message}</p>

  return (
    <DashboardInner
      games={games}
      profile={profile}
      username={username}
      range={range}
      isMonthlyView={false}
    />
  )
}

// ── Dashboard Inner ──────────────────────────────────────────────────

function DashboardInner({
  games,
  profile,
  username,
  range = '90D',
  isMonthlyView = false,
}: {
  games: any
  profile: any
  username: string
  range: string
  isMonthlyView: boolean
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [activeRange, setActiveRange] = useState(range)
  const [selectedYear, setSelectedYear] = useState<string>('')
  const navigate = useNavigate({
    from: '/dashboard/$username',
  })
  const playerName = profile?.name ?? username

  const { transformedData, progress } = useProgressiveTransform(games, username)

  const availableYears = useMemo(
    () => getAvailableYears(transformedData.standardgamesData),
    [transformedData.standardgamesData],
  )

  const allGraphData = useMemo(
    () => ({
      blitzGames: gamesDateWise(transformedData.blitzGames),
      rapidGames: gamesDateWise(transformedData.rapidGames),
      bulletGames: gamesDateWise(transformedData.bulletGames),
      dailyGames: gamesDateWise(transformedData.dailyGames),
    }),
    [transformedData],
  )

  const active = timeControls[activeTab]
  const rawData = allGraphData[active.dataKey]
  const rangeFiltered = useMemo(
    () => (isMonthlyView ? rawData : filterByRange(rawData, activeRange)),
    [rawData, activeRange, isMonthlyView],
  )
  const filteredData = useMemo(
    () =>
      activeRange === 'All' && selectedYear
        ? filterByYear(rangeFiltered, selectedYear)
        : rangeFiltered,
    [rangeFiltered, activeRange, selectedYear],
  )

  const entries = Object.entries(filteredData)
  const eloValues = entries.map(([, Daygames]) =>
    Number(Daygames.at(-1)?.PlayerELO ?? 0),
  )
  const filteredGames = entries.flatMap(([, Daygames]) => Daygames)
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

  // NOTE: useAnimatedNumber calls removed from here entirely.
  // Each stat's spin animation now lives inside <AnimatedStatValue>,
  // so its per-frame setState only re-renders that one <span>,
  // not this whole component (and therefore not AreaGraph/TabRow/etc).

  function handleRange(graphrange: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        range: graphrange,
      }),
    })
    setActiveRange(graphrange)
    if (graphrange !== 'All') {
      setSelectedYear('')
    }
  }

  const IconComp = active.icon

  console.log(
    'years:',
    availableYears,
    'sample dates:',
    transformedData.standardgamesData.slice(0, 3).map((g) => g.gameEndDate),
  )

  return (
    <PageWrapper>
      <TitleSection>
        <TitleMain>{`Games of ${playerName}`}</TitleMain>
        <Subtitle>
          Track your rating performance across different time controls.
        </Subtitle>
      </TitleSection>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
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
      </div>

      {/* Stat Cards */}
      <StatCardsRow>
        <StatCard>
          <FaCrown size={28} color="#5fd2e6" />
          <StatCardInfo>
            <StatCardLabel>Peak Rating</StatCardLabel>
            <StatCardValue>
              <AnimatedStatValue value={peakElo} />
            </StatCardValue>
          </StatCardInfo>
        </StatCard>

        <StatCard>
          <IoMdTrendingUp size={28} color={active.color} />
          <StatCardInfo>
            <StatCardLabel>Current Rating</StatCardLabel>
            <StatCardValue style={{ color: active.color }}>
              <AnimatedStatValue value={currentElo} />
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
              <AnimatedStatValue value={change} />
            </StatCardValue>
            <StatCardSub>
              ↑ <AnimatedStatValue value={Number(changePct)} />%
            </StatCardSub>
          </StatCardInfo>
        </StatCard>

        <StatCard>
          <FaGamepad size={28} color="#5fd2e6" />
          <StatCardInfo>
            <StatCardLabel>Games Played</StatCardLabel>
            <StatCardValue>
              <AnimatedStatValue value={filteredGames.length} />
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
              <AnimatedStatValue value={last30Change} />
            </StatCardValue>
            <StatCardSub>
              ↑ <AnimatedStatValue value={Number(last30Pct)} />%
            </StatCardSub>
          </StatCardInfo>
        </StatCard>
      </StatCardsRow>

      {/* Graph */}
      <GraphCard>
        {!isMonthlyView && (
          <GraphHeader>
            <RangeRow>
              {ranges.map((r) => (
                <RangeBtn
                  key={r}
                  $active={activeRange === r}
                  $color={active.color}
                  onClick={() => handleRange(r)}
                >
                  {r}
                </RangeBtn>
              ))}
            </RangeRow>
            {activeRange === 'All' && availableYears.length > 0 && (
              <YearSelect
                $color={active.color}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </YearSelect>
            )}
          </GraphHeader>
        )}
        {progress < 100 && (games?.length || 0) > 0 && (
          <div
            style={{
              width: '100%',
              height: 6,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: active.color,
                transition: 'width 0.2s ease',
                borderRadius: 3,
              }}
            />
          </div>
        )}
        <AreaGraph data={filteredData} color={active.color} />
      </GraphCard>
    </PageWrapper>
  )
}

// ── Main Component ───────────────────────────────────────────────────

function DashBoard() {
  const { username } = useParams({ from: '/dashboard/$username' })
  const {
    year,
    month,
    range = '90D',
  } = useSearch({ from: '/dashboard/$username' })
  const { data: profile, isPending: isFetchingProfile } = useProfile(username)

  if (year && month != null) {
    return (
      <MonthlyDashboard
        username={username}
        year={year}
        month={month}
        range={range}
        profile={profile}
        isFetchingProfile={isFetchingProfile}
      />
    )
  }

  return (
    <RecentDashboard
      username={username}
      range={range}
      profile={profile}
      isFetchingProfile={isFetchingProfile}
    />
  )
}

export default DashBoard
