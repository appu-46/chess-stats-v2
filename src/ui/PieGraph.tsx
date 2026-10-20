import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  // Sector,
} from 'recharts'

// const COLORS = ['#77DD77', '#FF6961', '#CFCFC4']
const COLORS = ['#2ecc71', '#e74c3c', '#f1c40f']
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

const SIZE = 180

export default function PieGraph({ record }: PieGraphProps) {
  if (!record) return <text> No Data available </text>
  const { percentageWins, percentageLosses, percentageDraws } = record
  // Empty slices are dropped: the padding angle would otherwise still leave
  // a gap for them in the ring.
  const data = [
    { name: 'Wins', value: percentageWins, color: COLORS[0] },
    { name: 'Losses', value: percentageLosses, color: COLORS[1] },
    { name: 'Draws', value: percentageDraws, color: COLORS[2] },
  ].filter((entry) => (entry.value ?? 0) > 0)

  return (
    <div
      style={{
        position: 'relative',
        width: SIZE,
        height: SIZE,
        flexShrink: 0,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            // Thin ring with rounded, separated segments, read clockwise
            // from 12 o'clock.
            innerRadius={SIZE / 2 - 16}
            outerRadius={SIZE / 2 - 4}
            startAngle={90}
            endAngle={-270}
            paddingAngle={data.length > 1 ? 4 : 0}
            cornerRadius={6}
            stroke="none"
            labelLine={false}
            label={false}
            dataKey="value"
            nameKey="name"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {(percentageWins ?? 0).toFixed(1)}%
        </span>
        <span
          style={{
            marginTop: '0.3rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0.55,
          }}
        >
          Win rate
        </span>
      </div>
    </div>
  )
}
