import styled from 'styled-components'
import { useState } from 'react'
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
import { GraphCard } from '../pages/DashBoard'
import type {
  RatingBucket,
  RatingHistory,
} from '../helpers/calculateRatingHistory'
import type { TimeControlConfig } from '../helpers/timeControls'

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`

const SectionSub = styled.p`
  font-size: 0.8rem;
  opacity: 0.6;
  margin: 0.15rem 0 0;
`

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8rem;
  opacity: 0.85;
`

const LegendItem = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  &::before {
    content: '';
    width: 14px;
    height: 2px;
    border-radius: 1px;
    background: ${({ $color }) => $color};
  }
`

const TableToggle = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 0.8rem;
  opacity: 0.6;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  align-self: flex-start;

  &:hover {
    opacity: 1;
  }
`

const TableScroll = styled.div`
  max-height: 16rem;
  overflow: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;

  th,
  td {
    padding: 0.35rem 0.5rem;
    text-align: right;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  th:first-child,
  td:first-child {
    text-align: left;
  }
  thead th {
    position: sticky;
    top: 0;
    background: var(--mantine-color-body);
    font-weight: 600;
  }

  [data-mantine-color-scheme='light'] & th,
  [data-mantine-color-scheme='light'] & td {
    border-bottom-color: rgba(0, 0, 0, 0.08);
  }
`

const EmptyNote = styled.p`
  font-size: 0.85rem;
  opacity: 0.5;
  margin: 0;
`

const BUCKET_LABELS: Record<RatingBucket, string> = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
}

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

function RatingHistoryGraph({
  history,
  timeControls,
}: {
  history: RatingHistory
  timeControls: Array<TimeControlConfig>
}) {
  const [showTable, setShowTable] = useState(false)
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  // Keep the platform's fixed time-control order (and so each series' color)
  // no matter which series happen to have data in this range.
  const series = timeControls.filter((tc) =>
    history.series.includes(tc.timeClass),
  )
  const { rows, bucket } = history

  const ink = isDark ? '#eeeeee' : '#222222'
  const mutedInk = isDark ? 'rgba(238,238,238,0.6)' : 'rgba(34,34,34,0.6)'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const surface = isDark ? '#1a1a1a' : '#ffffff'

  // Index of each series' last point (for its endpoint label) and how many
  // points it has (a one-point series draws no line, so it needs a dot).
  const lastIndex: Record<string, number> = {}
  const pointCount: Record<string, number> = {}
  for (const { timeClass } of series) {
    lastIndex[timeClass] = -1
    pointCount[timeClass] = 0
    rows.forEach((row, i) => {
      if (row[timeClass] == null) return
      lastIndex[timeClass] = i
      pointCount[timeClass]++
    })
  }

  return (
    <GraphCard>
      <HeaderRow>
        <div>
          <SectionTitle>Rating Over Time</SectionTitle>
          <SectionSub>
            Every time control, end-of-period rating ({BUCKET_LABELS[bucket]})
          </SectionSub>
        </div>
        {/* Shown even for one series: the title doesn't name the control. */}
        {series.length > 0 && (
          <Legend>
            {series.map(({ timeClass, label, color }) => (
              <LegendItem key={timeClass} $color={color}>
                {label}
              </LegendItem>
            ))}
          </Legend>
        )}
      </HeaderRow>

      {rows.length < 2 ? (
        <EmptyNote>
          Not enough rated games in this range to draw a trend.
        </EmptyNote>
      ) : (
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
                formatter={(value, name) => [
                  value,
                  series.find((s) => s.timeClass === name)?.label ?? name,
                ]}
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
              {series.map(({ timeClass, color }) => (
                <Line
                  key={timeClass}
                  type="monotone"
                  dataKey={timeClass}
                  stroke={color}
                  strokeWidth={2}
                  dot={
                    pointCount[timeClass] === 1
                      ? { r: 4, fill: color, stroke: surface, strokeWidth: 2 }
                      : false
                  }
                  activeDot={{ r: 4, stroke: surface, strokeWidth: 2 }}
                  // A rating carries over between buckets with no games.
                  connectNulls
                  isAnimationActive={false}
                  label={({ x, y, index, value }) =>
                    index === lastIndex[timeClass] ? (
                      <text
                        key={`${timeClass}-end`}
                        x={Number(x) + 8}
                        y={Number(y)}
                        dy={4}
                        fontSize={12}
                        fontWeight={600}
                        fill={ink}
                      >
                        {value}
                      </text>
                    ) : (
                      <g key={`${timeClass}-${index}`} />
                    )
                  }
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {rows.length > 0 && (
        <TableToggle type="button" onClick={() => setShowTable((v) => !v)}>
          {showTable ? 'Hide table' : 'View as table'}
        </TableToggle>
      )}
      {showTable && (
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th>Period</th>
                {series.map(({ timeClass, label }) => (
                  <th key={timeClass}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map((row) => (
                <tr key={row.bucket}>
                  <td>{formatBucket(row.bucket, bucket, true)}</td>
                  {series.map(({ timeClass }) => (
                    <td key={timeClass}>{row[timeClass] ?? '–'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      )}
    </GraphCard>
  )
}

export default RatingHistoryGraph
