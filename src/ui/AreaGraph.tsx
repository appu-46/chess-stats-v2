import {
  Area,
  AreaChart,
  // CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Game = {
  PlayerELO: string
}

type GroupedByDate = Record<string, Array<Game>>

function AreaGraph({ data }: { data?: { groupedByDate: GroupedByDate } }) {
  if (!data) return

  const groupedByDate = data.groupedByDate
  const graphData = Object.entries(groupedByDate).map(([date, games]) => ({
    date: date,
    elo: Number(games.at(-1)?.PlayerELO),
    gamesPlayed: Object.keys(games).length,
    rest: games,
  }))

  // Object.entries(groupedByDate).forEach(([date, games]) =>
  //   console.log(date, typeof games),
  // )

  console.log(graphData)
  return (
    <div style={{ width: '69rem', height: '20rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart width={500} height={400} data={graphData}>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00FF00" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00FF00" stopOpacity={0} />
          </linearGradient>
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
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
