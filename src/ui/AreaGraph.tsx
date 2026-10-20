import { useMantineColorScheme } from '@mantine/core'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import styled from 'styled-components'
import { parseDayKey } from '../helpers/DateFormat'
import { TitleMain } from '../pages/DashBoard'
import type { TooltipContentProps } from 'recharts'

type Game = {
  BlackElo: string
  PlayerELO: string
  Result: string
  TimeControl: string
  WhiteElo: string
  blackPlayer: string
  date_time: string
  gameEndDate: string
  moveCount: number
  resultForPlayer: string
  time_class: string
  url: string
  whitePlayer: string
}

type GroupedByDate = Record<string, Array<Game>>

type Point = {
  date: string
  elo: number
  change: number | null
  wins: number
  losses: number
  draws: number
  rest: Array<Game>
}

const Footnote = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  opacity: 0.5;
  text-align: center;
`

const TooltipCard = styled.div<{ $color: string; $isDark: boolean }>`
  min-width: 11rem;
  padding: 0.7rem 0.9rem;
  border-radius: 0.85rem;
  border: 1.5px solid ${({ $color }) => $color};
  background: ${({ $isDark }) => ($isDark ? '#1a1a1a' : '#ffffff')};
  color: ${({ $isDark }) => ($isDark ? '#eee' : '#222')};
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
`

const TooltipDate = styled.div`
  font-size: 0.75rem;
  opacity: 0.65;
`

const TooltipRating = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 1.35rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`

const TooltipChange = styled.span<{ $up: boolean }>`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $up }) => ($up ? '#22c55e' : '#ef4444')};
`

const TooltipHint = styled.div`
  margin-top: 0.15rem;
  font-size: 0.7rem;
  opacity: 0.45;
`

const DAY_TICKS_MAX_SPAN_DAYS = 120
const MAX_MONTH_TICKS = 12

// Short spans label individual days. Longer ones get one tick per month,
// on the first plotted day of it, since day labels would be too dense and
// month labels on arbitrary days repeat ("Jul '26, Jul '26, ...").
// Returns undefined for day ticks (recharts picks them).
function getMonthTicks(dayKeys: Array<string>): Array<string> | undefined {
  const first = dayKeys.at(0)
  const last = dayKeys.at(-1)
  if (!first || !last) return undefined
  const spanDays =
    (parseDayKey(last).getTime() - parseDayKey(first).getTime()) / 86_400_000
  if (spanDays <= DAY_TICKS_MAX_SPAN_DAYS) return undefined

  const firstOfMonth: Array<string> = []
  let lastMonth = ''
  for (const key of dayKeys) {
    const month = key.slice(0, 7) // 'YYYY.MM'
    if (month !== lastMonth) firstOfMonth.push(key)
    lastMonth = month
  }
  // Multi-year spans: every Nth month, counted back from the latest.
  const step = Math.ceil(firstOfMonth.length / MAX_MONTH_TICKS)
  return firstOfMonth.filter(
    (_, i) => (firstOfMonth.length - 1 - i) % step === 0,
  )
}

// "Sep 14"
function formatDayTick(key: string) {
  return parseDayKey(key).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// "Sep '26" - toLocaleDateString's 2-digit year drops the apostrophe, which
// makes "Sep 26" read as a day.
function formatMonthTick(key: string) {
  const month = parseDayKey(key).toLocaleDateString('en-US', {
    month: 'short',
  })
  return `${month} '${key.slice(2, 4)}`
}

function RatingTooltip({
  active,
  payload,
  color,
  isDark,
}: Partial<TooltipContentProps<number, string>> & {
  color: string
  isDark: boolean
}) {
  const point = payload?.[0]?.payload as Point | undefined
  if (!active || !point) return null

  const gamesCount = point.rest.length
  return (
    <TooltipCard $color={color} $isDark={isDark}>
      <TooltipDate>
        {parseDayKey(point.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </TooltipDate>
      <TooltipRating style={{ color }}>
        {point.elo}
        {point.change !== null && point.change !== 0 && (
          <TooltipChange $up={point.change > 0}>
            {point.change > 0 ? '+' : ''}
            {point.change}
          </TooltipChange>
        )}
      </TooltipRating>
      <div>
        {gamesCount} {gamesCount === 1 ? 'game' : 'games'} ·{' '}
        <span style={{ color: '#22c55e' }}>{point.wins}W</span>{' '}
        <span style={{ color: '#ef4444' }}>{point.losses}L</span>{' '}
        <span style={{ opacity: 0.7 }}>{point.draws}D</span>
      </div>
      <TooltipHint>Click to open this month's games</TooltipHint>
    </TooltipCard>
  )
}

function AreaGraph({
  data,
  color = '#00FF00',
}: {
  data?: GroupedByDate
  color?: string
}) {
  // Hooks run before the empty-data early return: the dashboard renders this
  // with no data first and fills it in progressively, and a changing hook
  // count between renders breaks React.
  const { username } = useParams({ from: '/dashboard/$username' })
  const { platform } = useSearch({ from: '/dashboard/$username' })
  const navigate = useNavigate()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  if (
    !data ||
    Object.keys(data).length === 0 ||
    Object.values(data).every((games) => games.length === 0)
  ) {
    return <TitleMain>No data available</TitleMain>
  }

  function handleClick(clickedData: any) {
    if (clickedData?.activeLabel) {
      // Day keys are 'YYYY.MM.DD'; the Games page loads that day from the URL.
      const [year, month, day] = String(clickedData.activeLabel).split('.')
      const gamesForDate = data?.[clickedData.activeLabel]

      navigate({
        to: '/games/$username',
        params: { username },
        search: { year, month, day, ...(platform && { platform }) },
        // Shown straight away; the page falls back to loading the day from
        // the URL when this is missing (reload, shared link).
        state: { games: gamesForDate } as any,
      })
    }
  }

  let previousElo: number | null = null
  const graphData: Array<Point> = Object.entries(data).map(([date, games]) => {
    const elo = Number(games.at(-1)?.PlayerELO)
    const point: Point = {
      date,
      elo,
      change: previousElo === null ? null : elo - previousElo,
      wins: 0,
      losses: 0,
      draws: 0,
      rest: games,
    }
    for (const game of games) {
      if (game.resultForPlayer === 'win') point.wins++
      else if (game.resultForPlayer === 'loss') point.losses++
      else point.draws++
    }
    previousElo = elo
    return point
  })
  const monthTicks = getMonthTicks(graphData.map((point) => point.date))
  const peakElo = Math.max(...graphData.map((point) => point.elo))

  return (
    <div>
      <div style={{ width: 'auto', height: '20rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={graphData}
            onClick={handleClick}
            // Headroom for the peak label when the peak sits at the top.
            margin={{ top: 18, right: 8 }}
            style={{ cursor: 'pointer' }}
          >
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="15%" stopColor={color} stopOpacity={0.8} />
              <stop offset="85%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <CartesianGrid
              opacity={0.05}
              strokeDasharray="3 3"
              color="inherit"
            />
            <XAxis
              dataKey="date"
              ticks={monthTicks}
              tickFormatter={(value: string) =>
                monthTicks ? formatMonthTick(value) : formatDayTick(value)
              }
              domain={['auto', 'auto']}
              tick={{
                fill: `${color}`,
                fontSize: 16,
                fontWeight: 600,
              }}
              axisLine={{ stroke: `${color}`, strokeWidth: 2 }}
              tickLine={false}
              interval="preserveEnd"
              minTickGap={20}
              allowDataOverflow={true}
            />
            <YAxis
              dataKey="elo"
              domain={['auto', 'auto']}
              tick={{
                fill: `${color}`,
                fontSize: 18,
                fontWeight: 600,
              }}
              axisLine={{ stroke: `${color}`, strokeWidth: 2 }}
              tickLine={false}
              interval="preserveStartEnd"
              allowDataOverflow={true}
            />
            <Tooltip
              content={<RatingTooltip color={color} isDark={isDark} />}
              cursor={{ stroke: isDark ? '#ddd' : '#555', strokeWidth: 1.5 }}
            />
            <ReferenceLine
              y={peakElo}
              stroke={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'}
              strokeDasharray="6 6"
              label={{
                value: `Peak ${peakElo}`,
                position: 'insideBottomRight',
                fill: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <Area
              type="monotone"
              dataKey="elo"
              stroke={color}
              fill="url(#colorUv)"
              strokeWidth={5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <Footnote>
        Each point is the rating after the last game of that day. Click a point
        to open that month's games.
      </Footnote>
    </div>
  )
}

export default AreaGraph
