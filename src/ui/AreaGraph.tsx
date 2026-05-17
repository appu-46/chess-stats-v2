import {
  Area,
  AreaChart,
  CartesianGrid,
  // CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useNavigate, useParams } from '@tanstack/react-router'
import { queryFormatDate } from '../helpers/DateFormat'
import { TitleMain } from '../pages/DashBoard'

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

function AreaGraph({
  data,
  color = '#00FF00',
}: {
  data?: GroupedByDate
  color?: string
}) {
  if (
    !data ||
    Object.keys(data).length === 0 ||
    Object.values(data).every((games) => games.length === 0)
  ) {
    return <TitleMain>No data available</TitleMain>
  }

  const { username } = useParams({ from: '/dashboard/$username' })
  const navigate = useNavigate()

  function handleClick(clickedData: any) {
    if (clickedData?.activeLabel) {
      const clickedDate = queryFormatDate(
        clickedData.activeLabel,
      ).formattedDate.split('-')
      const gamesForDate = data?.[clickedData.activeLabel]
      const year = clickedDate[0]
      const month = clickedDate[1]

      navigate({
        to: '/games/$username',
        params: { username },
        search: { year: year, month: month },
        state: { games: gamesForDate } as any,
      })
    }
  }

  const graphData = Object.entries(data).map(([date, games]) => ({
    date: date,
    elo: Number(games.at(-1)?.PlayerELO),
    gamesPlayed: Object.keys(games).length,
    rest: games,
  }))

  console.log(data, graphData)

  return (
    <div style={{ width: 'auto', height: '20rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={graphData}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="15%" stopColor={color} stopOpacity={0.8} />
            <stop offset="85%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <CartesianGrid opacity={0.3} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            domain={['auto', 'auto']}
            tick={{
              fill: 'rgba(255,255,255,0.8)',
              fontSize: 16,
              fontWeight: 600,
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="elo"
            domain={['auto', 'auto']}
            tick={{
              fill: 'rgba(255,255,255,0.8)',
              fontSize: 16,
              fontWeight: 600,
            }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: `2.5px solid ${color}`,
              borderRadius: '1rem',
            }}
            labelStyle={{ color: color }}
            cursor={{ stroke: color, strokeWidth: 3.5 }}
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
  )
}

export default AreaGraph
