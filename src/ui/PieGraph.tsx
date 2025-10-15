import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  // Sector,
} from 'recharts'

const RADIAN = Math.PI / 180

// const COLORS = ['#77DD77', '#FF6961', '#CFCFC4']
const COLORS = ['#00FF00', '#DC143C', '#F0E68C']
/*
type Coordinate = {
  x: number
  y: number
}
type PieSectorData = {
  percent?: number
  name?: string | number
  midAngle?: number
  middleRadius?: number
  tooltipPosition?: Coordinate
  value?: number
  paddingAngle?: number
  dataKey?: string
  payload?: any
}

type PieSectorDataItem = React.SVGProps<SVGPathElement> &
  Partial<SectorProps> &
  PieSectorData

const renderActiveShape = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  percent,
}: PieSectorDataItem) => {
  const sin = Math.sin(-RADIAN * (midAngle ?? 1))
  const cos = Math.cos(-RADIAN * (midAngle ?? 1))
  const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos
  const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin
  const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos
  const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(outerRadius ?? 0) + 6}
        outerRadius={(outerRadius ?? 0) + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 1}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill={fill}
      >
        {`${((percent ?? 1) * 100).toFixed(2)}%`}
      </text>
    </g>
  )
}
*/
interface PieGraphProps {
  record:
    | {
        percentageDraws?: number | null
        percentageWins?: number | null
        percentageLosses?: number | null
      }
    | null
    | undefined
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.23
  const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN)
  const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#111"
      fontSize={9.5}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  )
}

export default function PieGraph({ record }: PieGraphProps) {
  if (!record) return <text> No Data available </text>
  const { percentageWins, percentageLosses, percentageDraws } = record
  const data = [
    { name: 'Wins', value: percentageWins },
    { name: 'Losses', value: percentageLosses },
    { name: 'Draws', value: percentageDraws },
  ]
  return (
    <div style={{ width: '350px', height: '250px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4.6}
            legendType="circle"
            dataKey="value"
            nameKey="name"
            label={renderCustomizedLabel}
            animationBegin={0}
            animationDuration={800}
            // activeShape={renderActiveShape}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend align="right" layout="vertical" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
