import {
  Area,
  AreaChart,
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

function AreaGraph({ data }: { data?: GroupedByDate }) {
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
      const clickedDate = queryFormatDate(clickedData.activeLabel)
      const gamesForDate = data?.[clickedData.activeLabel]

      navigate({
        to: '/games/$username',
        params: { username },
        search: { date: clickedDate },
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

  return (
    <div style={{ width: '69rem', height: '20rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={graphData}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00FF00" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00FF00" stopOpacity={0} />
          </linearGradient>
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #00FF00',
            }}
            labelStyle={{ color: '#00FF00' }}
            cursor={{ stroke: '#00FF00', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="elo"
            stroke="#00FF00"
            fill="url(#colorUv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AreaGraph
