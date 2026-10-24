// Both players' ratings in one time control on one chart: a line each,
// end-of-period rating, with each line's latest value at its end.
import { useMantineColorScheme } from '@mantine/core'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import dayjs from 'dayjs'
import type {
  RatingBucket,
  RatingHistory,
} from '../helpers/calculateRatingHistory'
import type { Side } from '../helpers/compareStats'

function formatBucket(bucket: string, size: RatingBucket, long = false) {
  if (size === 'month') {
    return dayjs(`${bucket}-01`).format(long ? 'MMMM YYYY' : "MMM 'YY")
  }
  const date = dayjs(bucket)
  if (size === 'week') {
    return long ? `Week of ${date.format('D MMM YYYY')}` : date.format('D MMM')
  }
  return date.format(long ? 'D MMM YYYY' : 'D MMM')
}

function CompareRatingChart({
  history,
  names,
  colors,
}: {
  // Series keyed 'a' and 'b'.
  history: RatingHistory
  names: Record<Side, string>
  colors: Record<Side, string>
}) {
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'
  const { rows, bucket } = history
  const sides = (['a', 'b'] as const).filter((side) =>
    history.series.includes(side),
  )

  const ink = isDark ? '#eeeeee' : '#222222'
  const mutedInk = isDark ? 'rgba(238,238,238,0.6)' : 'rgba(34,34,34,0.6)'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const surface = isDark ? '#1a1a1a' : '#ffffff'

  // Each line's last point gets its value as a label; a one-point line
  // draws nothing, so it gets a dot instead.
  const lastIndex: Record<string, number> = {}
  const pointCount: Record<string, number> = {}
  for (const side of sides) {
    lastIndex[side] = -1
    pointCount[side] = 0
    rows.forEach((row, i) => {
      if (row[side] == null) return
      lastIndex[side] = i
      pointCount[side]++
    })
  }

  return (
    <div style={{ width: '100%', height: '18rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={rows}
          margin={{ top: 8, right: 48, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="bucket"
            tickFormatter={(value) => formatBucket(value, bucket)}
            tick={{ fill: mutedInk, fontSize: 12 }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: mutedInk, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            labelFormatter={(value) =>
              formatBucket(String(value), bucket, true)
            }
            formatter={(value, name) => [value, names[name as Side]]}
            contentStyle={{
              backgroundColor: surface,
              color: ink,
              border: `1px solid ${gridColor}`,
              borderRadius: '0.75rem',
            }}
            labelStyle={{ color: ink, fontWeight: 600 }}
            itemStyle={{ color: ink }}
            cursor={{ stroke: mutedInk, strokeWidth: 1 }}
          />
          {sides.map((side) => (
            <Line
              key={side}
              type="monotone"
              dataKey={side}
              stroke={colors[side]}
              strokeWidth={2}
              dot={
                pointCount[side] === 1
                  ? {
                      r: 4,
                      fill: colors[side],
                      stroke: surface,
                      strokeWidth: 2,
                    }
                  : false
              }
              activeDot={{ r: 4, stroke: surface, strokeWidth: 2 }}
              // A rating carries over between periods with no games.
              connectNulls
              isAnimationActive={false}
              label={({ x, y, index, value }) =>
                index === lastIndex[side] ? (
                  <text
                    key={`${side}-end`}
                    x={Number(x) + 8}
                    y={Number(y)}
                    dy={4}
                    fontSize={12}
                    fontWeight={600}
                    fill={colors[side]}
                  >
                    {value}
                  </text>
                ) : (
                  <g key={`${side}-${index}`} />
                )
              }
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CompareRatingChart
