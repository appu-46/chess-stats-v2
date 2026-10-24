import styled from 'styled-components'
import {
  FaChartArea,
  FaFire,
  FaGamepad,
  FaInfoCircle,
  FaShieldAlt,
  FaTrophy,
} from 'react-icons/fa'
import { FaCrown } from 'react-icons/fa6'
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io'
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
import { parseDayKey } from '../helpers/DateFormat'
import { calculateStreaks } from '../helpers/calculateStreaks'
import { calculateRatingHistory } from '../helpers/calculateRatingHistory'
import AreaGraph from '../ui/AreaGraph'
import WinRateBreakdown from '../ui/WinRateBreakdown'
import RatingHistoryGraph from '../ui/RatingHistoryGraph'
import OpeningTrends from '../ui/OpeningTrends'
import StatCarousel, { StatCard } from '../ui/StatCarousel'
import usePlatform from '../hooks/usePlatform'
import { getTimeControls } from '../helpers/timeControls'
import { LICHESS_MAX_GAMES } from '../services/apiLichess'
import PageHeader from '../ui/PageHeader'
import PageError from '../ui/PageError'
import type { TransformedGame } from '../helpers/transformGame'
import type { RawGame } from '../services/apiPlayer'
import type { Platform } from '../helpers/platform'

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

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const CapNotice = styled.p`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  opacity: 0.6;
  margin: 0.25rem 0 0;
`

// ── Tabs ────────────────────────────────────────────────────────────

// Time-control switch, in the page header's right-hand slot.
const TabRow = styled.div`
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
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
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    flex-shrink: 0;
  }
  border: ${({ $active, $color }) =>
    $active ? `1.5px solid ${$color}` : '1.5px solid transparent'};
  background: ${({ $active }) =>
    $active ? `rgba(0, 0, 0, 0.3);` : 'transparent'};
  color: ${({ $active, $color }) => ($active ? $color : 'inherit')};
  font-size: ${({ $active }) => ($active ? '1.1rem' : '1rem')};
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

// ── Graph Card ──────────────────────────────────────────────────────

export const GraphCard = styled.div`
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
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
`

const GraphTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`

const GraphTitle = styled.h3`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  font-weight: 700;
`

const GraphSubtitle = styled.p`
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.55;
`

const GraphControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
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
    background: rgba(255, 255, 255, 0.5);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    option {
      background: rgba(255, 255, 255, 0.5);
      color: inherit;
    }
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

// ── Range Filters ────────────────────────────────────────────────────

const ranges = ['7D', '30D', '90D', '1Y', 'All']

function rangeCutoff(range: string): Date | null {
  if (range === 'All') return null
  const days =
    range === '7D' ? 7 : range === '30D' ? 30 : range === '90D' ? 90 : 365
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return cutoff
}

function filterByRange(
  data: Record<string, Array<any>>,
  range: string,
): Record<string, Array<any>> {
  const cutoff = rangeCutoff(range)
  if (!cutoff) return data
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

function dayKey(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}.${mm}.${dd}`
}

// Same range/year semantics as filterByRange + filterByYear, applied to a
// flat game list. Runs on every progressive-load emit, so it compares the
// zero-padded YYYY.MM.DD keys as strings instead of parsing a Date per game.
// A day key parses to local midnight, which is before the (time-of-day)
// cutoff on the cutoff day itself - hence strictly greater.
function filterGamesByRange(
  games: Array<TransformedGame> | undefined,
  range: string,
  year: string,
): Array<TransformedGame> {
  if (!games?.length) return []
  const cutoff = rangeCutoff(range)
  const cutoffKey = cutoff ? dayKey(cutoff) : null
  const yearPrefix = range === 'All' && year ? `${year}.` : null
  return games.filter(
    (game) =>
      (!cutoffKey || game.gameEndDate > cutoffKey) &&
      (!yearPrefix || game.gameEndDate.startsWith(yearPrefix)),
  )
}

const RANGE_LABELS: Record<string, string> = {
  '7D': 'Last 7 days',
  '30D': 'Last 30 days',
  '90D': 'Last 90 days',
  '1Y': 'Last 12 months',
  All: 'All time',
}

function formatDayKey(key: string, withYear: boolean) {
  return parseDayKey(key).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear && { year: 'numeric' }),
  })
}

// "Sep 21 – Sep 30, 2026" for the days actually plotted (which can start
// later than the range when the player had no games early in it).
function formatDaySpan(dayKeys: Array<string>): string {
  const first = dayKeys.at(0)
  const last = dayKeys.at(-1)
  if (!first || !last) return ''
  if (first === last) return formatDayKey(first, true)
  const sameYear = first.slice(0, 4) === last.slice(0, 4)
  return `${formatDayKey(first, !sameYear)} – ${formatDayKey(last, true)}`
}

function getAvailableYears(games: Array<any> | undefined): Array<string> {
  if (!games?.length) return []
  const years = new Set<string>()
  for (const game of games) {
    if (game?.gameEndDate) {
      const year = game.gameEndDate.split('.')[0]

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
  platform,
  profile,
  isFetchingProfile,
}: {
  username: string
  year: string
  month: string
  range: string
  platform: Platform
  profile: any
  isFetchingProfile: boolean
}) {
  const {
    games,
    isPending: isFetchingGames,
    error,
  } = useGames(username, year, month, platform)

  if (isFetchingGames || isFetchingProfile) return <DashboardSkeleton />
  if (error) return <PageError error={error} />

  return (
    <DashboardInner
      games={games}
      profile={profile}
      username={username}
      range={range}
      platform={platform}
      isMonthlyView={true}
    />
  )
}

function RecentDashboard({
  username,
  range,
  platform,
  profile,
  isFetchingProfile,
}: {
  username: string
  range: string
  platform: Platform
  profile: any
  isFetchingProfile: boolean
}) {
  const {
    data: games,
    isPending: isFetchingGames,
    error,
  } = useGamesRecentdays(username, range, platform)

  if (isFetchingGames || isFetchingProfile)
    return (
      <DashboardSkeleton
        message={
          platform === 'lichess'
            ? 'Lichess sends games at about 20 per second, so a busy player can take up to a minute to load...'
            : 'If you have played a lot of games, it may take a while to load graphs...'
        }
      />
    )
  if (error) return <PageError error={error} />

  return (
    <DashboardInner
      games={games}
      profile={profile}
      username={username}
      range={range}
      platform={platform}
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
  platform,
  isMonthlyView = false,
}: {
  games: Array<RawGame> | undefined
  profile: any
  username: string
  range: string
  platform: Platform
  isMonthlyView: boolean
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [activeRange, setActiveRange] = useState(range)
  const [selectedYear, setSelectedYear] = useState<string>('')
  const navigate = useNavigate({
    from: '/dashboard/$username',
  })

  const { transformedData, progress } = useProgressiveTransform(
    games,
    username,
    platform,
  )
  const timeControls = getTimeControls(platform)

  const availableYears = getAvailableYears(transformedData.standardgamesData)

  const allGraphData = useMemo(
    () =>
      Object.fromEntries(
        timeControls.map(({ timeClass }) => [
          timeClass,
          gamesDateWise(transformedData.byTimeClass[timeClass]),
        ]),
      ),
    [transformedData, timeControls],
  )

  const active = timeControls[Math.min(activeTab, timeControls.length - 1)]
  const rawData = allGraphData[active.timeClass]
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
  const filteredGames = useMemo(
    () => Object.values(filteredData).flat() as Array<TransformedGame>,
    [filteredData],
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

  const streaks = useMemo(
    () => calculateStreaks(filteredGames),
    [filteredGames],
  )

  // Spans every time control (not just the active tab), scoped to the same
  // range/year as the main graph.
  const ratingHistory = useMemo(() => {
    const inRange = Object.fromEntries(
      timeControls.map(({ timeClass }) => [
        timeClass,
        isMonthlyView
          ? transformedData.byTimeClass[timeClass]
          : filterGamesByRange(
              transformedData.byTimeClass[timeClass],
              activeRange,
              selectedYear,
            ),
      ]),
    )
    return calculateRatingHistory(
      inRange,
      timeControls.map(({ timeClass }) => timeClass),
    )
  }, [transformedData, timeControls, isMonthlyView, activeRange, selectedYear])

  const isCapped =
    platform === 'lichess' && (games?.length ?? 0) >= LICHESS_MAX_GAMES
  const currentStreakColor =
    streaks.currentStreak.type === 'win'
      ? '#22c55e'
      : streaks.currentStreak.type === 'loss'
        ? '#ef4444'
        : '#a855f7'
  const changeColor = change >= 0 ? '#22c55e' : '#ef4444'
  const last30Color = last30Change >= 0 ? '#22c55e' : '#ef4444'
  const currentStreakLabel =
    streaks.currentStreak.type === 'win'
      ? 'wins in a row'
      : streaks.currentStreak.type === 'loss'
        ? 'losses in a row'
        : 'draws in a row'
  const currentStreakSuffix =
    streaks.currentStreak.type === 'win'
      ? 'W'
      : streaks.currentStreak.type === 'loss'
        ? 'L'
        : 'D'

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

  const plottedDays = entries.map(([day]) => day)
  const periodLabel = isMonthlyView
    ? plottedDays[0]
      ? parseDayKey(plottedDays[0]).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
      : ''
    : activeRange === 'All' && selectedYear
      ? selectedYear
      : RANGE_LABELS[activeRange]
  const graphSubtitle = [
    periodLabel,
    `${filteredGames.length.toLocaleString('en-US')} ${filteredGames.length === 1 ? 'game' : 'games'}`,
    formatDaySpan(plottedDays),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <PageWrapper>
      <TitleSection>
        <PageHeader
          icon={FaChartArea}
          section="Dashboard"
          username={username}
          platform={platform}
          profile={profile}
          subtitle={
            isMonthlyView ? periodLabel : 'Rating performance over time'
          }
          aside={
            <TabRow role="tablist" aria-label="Time control">
              {timeControls.map(({ label, color, icon: Icon }, i) => (
                <Tab
                  key={label}
                  role="tab"
                  aria-selected={activeTab === i}
                  $active={activeTab === i}
                  $color={color}
                  onClick={() => setActiveTab(i)}
                >
                  <Icon size={15} />
                  {label}
                </Tab>
              ))}
            </TabRow>
          }
        />
        {isCapped && (
          <CapNotice>
            <FaInfoCircle size={12} />
            Showing the most recent {LICHESS_MAX_GAMES.toLocaleString(
              'en-IN',
            )}{' '}
            Lichess games in this range
          </CapNotice>
        )}
      </TitleSection>

      {/* Stat Cards */}
      <StatCarousel title="Overview">
        <StatCard
          icon={<FaCrown size={14} />}
          label="Peak Rating"
          accent="#5fd2e6"
          value={<AnimatedStatValue value={peakElo} />}
          sub="all loaded games"
        />
        <StatCard
          icon={<IoMdTrendingUp size={15} />}
          label="Current Rating"
          accent={active.color}
          valueColor={active.color}
          value={<AnimatedStatValue value={currentElo} />}
          sub={active.label}
        />
        <StatCard
          icon={<IconComp size={14} />}
          label="Change"
          accent={changeColor}
          valueColor={changeColor}
          value={
            <>
              {change >= 0 ? '+' : ''}
              <AnimatedStatValue value={change} />
            </>
          }
          sub={
            <>
              {change >= 0 ? '↑' : '↓'}{' '}
              <AnimatedStatValue value={Math.abs(Number(changePct))} />%
            </>
          }
        />
        <StatCard
          icon={<FaGamepad size={15} />}
          label="Games Played"
          accent="#5fd2e6"
          value={<AnimatedStatValue value={filteredGames.length} />}
          sub="in this range"
        />
        <StatCard
          icon={<MdCalendarMonth size={15} />}
          label="Last 30 Days"
          accent={last30Color}
          valueColor={last30Color}
          value={
            <>
              {last30Change >= 0 ? '+' : ''}
              <AnimatedStatValue value={last30Change} />
            </>
          }
          sub={
            <>
              {last30Change >= 0 ? '↑' : '↓'}{' '}
              <AnimatedStatValue value={Math.abs(Number(last30Pct))} />%
            </>
          }
        />
        <StatCard
          icon={<FaFire size={14} />}
          label="Current Streak"
          accent={currentStreakColor}
          valueColor={currentStreakColor}
          value={
            streaks.currentStreak.count === 0 ? (
              '–'
            ) : (
              <>
                <AnimatedStatValue value={streaks.currentStreak.count} />
                {currentStreakSuffix}
              </>
            )
          }
          sub={
            streaks.currentStreak.count === 0
              ? 'no games yet'
              : currentStreakLabel
          }
        />
        <StatCard
          icon={<FaTrophy size={14} />}
          label="Longest Win Streak"
          accent="#22c55e"
          valueColor="#22c55e"
          value={<AnimatedStatValue value={streaks.longestWinStreak} />}
          sub="wins in a row"
        />
        <StatCard
          icon={<IoMdTrendingDown size={15} />}
          label="Longest Loss Streak"
          accent="#ef4444"
          valueColor="#ef4444"
          value={<AnimatedStatValue value={streaks.longestLossStreak} />}
          sub="losses in a row"
        />
        <StatCard
          icon={<FaShieldAlt size={14} />}
          label="Bounce-back Rate"
          accent="#5fd2e6"
          value={
            <>
              <AnimatedStatValue value={Math.round(streaks.winRateAfterLoss)} />
              %
            </>
          }
          sub="win rate after a loss"
        />
      </StatCarousel>

      {/* Graph */}
      <GraphCard>
        <GraphHeader>
          <GraphTitleBlock>
            <GraphTitle>
              <IconComp size={16} color={active.color} />
              {active.label} rating
            </GraphTitle>
            <GraphSubtitle>{graphSubtitle}</GraphSubtitle>
          </GraphTitleBlock>
          {!isMonthlyView && (
            <GraphControls>
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
            </GraphControls>
          )}
        </GraphHeader>
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
        <AreaGraph
          data={filteredData}
          color={active.color}
          isLoading={progress < 100}
        />
      </GraphCard>

      <RatingHistoryGraph history={ratingHistory} timeControls={timeControls} />

      <WinRateBreakdown games={filteredGames} username={username} />

      <OpeningTrends games={filteredGames} username={username} />
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
  const platform = usePlatform()
  const { data: profile, isPending: isFetchingProfile } = useProfile(
    username,
    platform,
  )

  if (year && month != null) {
    return (
      <MonthlyDashboard
        username={username}
        year={year}
        month={month}
        range={range}
        platform={platform}
        profile={profile}
        isFetchingProfile={isFetchingProfile}
      />
    )
  }

  return (
    <RecentDashboard
      username={username}
      range={range}
      platform={platform}
      profile={profile}
      isFetchingProfile={isFetchingProfile}
    />
  )
}

export default DashBoard
