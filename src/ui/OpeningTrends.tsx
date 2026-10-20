import styled from 'styled-components'
import { useMemo } from 'react'
import { FaArrowDown, FaArrowUp, FaChessBoard } from 'react-icons/fa'
import { GraphCard } from '../pages/DashBoard'
import { calculateOpeningStats } from '../helpers/calculateOpeningStats'
import type { OpeningRecord } from '../helpers/calculateOpeningStats'

type Game = {
  whitePlayer: string
  resultForPlayer: 'win' | 'loss' | 'draw'
  openingFamily: string | null
  endTime: number
}

const WIN_COLOR = '#22c55e'
const LOSS_COLOR = '#ef4444'
const DRAW_COLOR = '#f1c40f'

// A usage shift smaller than this (in percentage points) reads as noise.
const TREND_THRESHOLD_PTS = 5

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
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const SectionSub = styled.p`
  font-size: 0.8rem;
  opacity: 0.6;
  margin: 0.15rem 0 0;
`

const LegendRow = styled.div`
  display: flex;
  gap: 1.25rem;
  font-size: 0.8rem;
  opacity: 0.75;
`

const LegendSwatch = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: ${({ $color }) => $color};
  }
`

const HighlightRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Highlight = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border-left: 3px solid ${({ $color }) => $color};
  background: rgba(255, 255, 255, 0.03);

  [data-mantine-color-scheme='light'] & {
    background: rgba(255, 255, 255, 0.55);
  }
`

const HighlightLabel = styled.span`
  font-size: 0.75rem;
  opacity: 0.6;
`

const HighlightValue = styled.span`
  font-size: 1rem;
  font-weight: 700;
`

const HighlightSub = styled.span`
  font-size: 0.75rem;
  opacity: 0.6;
`

const ColorColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`

const ColumnHeading = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
  opacity: 0.85;
`

const OpeningRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.85rem;
`

const OpeningLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  font-size: 0.8rem;
`

const OpeningName = styled.span`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`

const OpeningMeta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
  opacity: 0.75;
  font-variant-numeric: tabular-nums;
`

const Trend = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.7rem;
  opacity: 0.9;
`

const StackedBarTrack = styled.div`
  display: flex;
  gap: 2px;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);

  [data-mantine-color-scheme='light'] & {
    background: rgba(0, 0, 0, 0.06);
  }
`

const StackedBarSegment = styled.div<{ $color: string; $pct: number }>`
  background: ${({ $color }) => $color};
  flex: ${({ $pct }) => `0 0 ${$pct}%`};
  min-width: ${({ $pct }) => ($pct > 0 ? '2px' : '0')};
`

const EmptyNote = styled.p`
  font-size: 0.85rem;
  opacity: 0.5;
  margin: 0;
`

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

function TrendBadge({ trendPts }: { trendPts: number | null }) {
  if (trendPts == null || Math.abs(trendPts) < TREND_THRESHOLD_PTS) return null
  const up = trendPts > 0
  const pts = Math.round(Math.abs(trendPts))
  return (
    <Trend
      title={`Played ${pts} percentage points ${up ? 'more' : 'less'} often in the second half of this period`}
    >
      {up ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
      {pts} pts
    </Trend>
  )
}

function OpeningList({
  records,
  emptyLabel,
}: {
  records: Array<OpeningRecord>
  emptyLabel: string
}) {
  if (!records.length) return <EmptyNote>{emptyLabel}</EmptyNote>

  return (
    <>
      {records.map((record) => (
        <OpeningRow key={record.name}>
          <OpeningLabelRow>
            <OpeningName title={record.name}>{record.name}</OpeningName>
            <OpeningMeta>
              <TrendBadge trendPts={record.trendPts} />
              <span>{plural(record.games, 'game')}</span>
              <span>{Math.round(record.scorePct)}%</span>
            </OpeningMeta>
          </OpeningLabelRow>
          <StackedBarTrack
            title={`${record.wins}W ${record.draws}D ${record.losses}L · score ${Math.round(record.scorePct)}%`}
          >
            <StackedBarSegment
              $color={WIN_COLOR}
              $pct={(record.wins / record.games) * 100}
            />
            <StackedBarSegment
              $color={DRAW_COLOR}
              $pct={(record.draws / record.games) * 100}
            />
            <StackedBarSegment
              $color={LOSS_COLOR}
              $pct={(record.losses / record.games) * 100}
            />
          </StackedBarTrack>
        </OpeningRow>
      ))}
    </>
  )
}

function OpeningHighlight({
  label,
  record,
  color,
}: {
  label: string
  record: OpeningRecord
  color: string
}) {
  return (
    <Highlight $color={color}>
      <HighlightLabel>{label}</HighlightLabel>
      <HighlightValue>{record.name}</HighlightValue>
      <HighlightSub>
        {Math.round(record.scorePct)}% score as {record.color} ·{' '}
        {plural(record.games, 'game')}
      </HighlightSub>
    </Highlight>
  )
}

function OpeningTrends({
  games,
  username,
}: {
  games: Array<Game>
  username: string
}) {
  const stats = useMemo(
    () => calculateOpeningStats(games, username),
    [games, username],
  )

  const hasAny = stats.white.length > 0 || stats.black.length > 0

  return (
    <GraphCard>
      <HeaderRow>
        <div>
          <SectionTitle>
            <FaChessBoard size={16} /> Opening Trends
          </SectionTitle>
          <SectionSub>
            Most-played openings by color · score counts a draw as half a win
          </SectionSub>
        </div>
        {hasAny && (
          <LegendRow>
            <LegendSwatch $color={WIN_COLOR}>Win</LegendSwatch>
            <LegendSwatch $color={DRAW_COLOR}>Draw</LegendSwatch>
            <LegendSwatch $color={LOSS_COLOR}>Loss</LegendSwatch>
          </LegendRow>
        )}
      </HeaderRow>

      {!hasAny ? (
        <EmptyNote>No opening data for games in this range.</EmptyNote>
      ) : (
        <>
          {(stats.best || stats.worst) && (
            <HighlightRow>
              {stats.best && (
                <OpeningHighlight
                  label="Best opening"
                  record={stats.best}
                  color={WIN_COLOR}
                />
              )}
              {stats.worst && (
                <OpeningHighlight
                  label="Toughest opening"
                  record={stats.worst}
                  color={LOSS_COLOR}
                />
              )}
            </HighlightRow>
          )}
          <ColorColumns>
            <div>
              <ColumnHeading>As White</ColumnHeading>
              <OpeningList
                records={stats.white}
                emptyLabel="No games as white"
              />
            </div>
            <div>
              <ColumnHeading>As Black</ColumnHeading>
              <OpeningList
                records={stats.black}
                emptyLabel="No games as black"
              />
            </div>
          </ColorColumns>
        </>
      )}
    </GraphCard>
  )
}

export default OpeningTrends
