import styled from 'styled-components'
import { useMemo } from 'react'
import { GraphCard } from '../pages/DashBoard'
import { calculateWinRateBreakdown } from '../helpers/calculateWinRateBreakdown'
import type { TerminationSlice } from '../helpers/calculateWinRateBreakdown'

type Game = {
  whitePlayer: string
  resultForPlayer: 'win' | 'loss' | 'draw'
  Termination?: string
}

const WIN_COLOR = '#22c55e'
const LOSS_COLOR = '#ef4444'
const DRAW_COLOR = '#f1c40f'

const BreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
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

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const ColorLabel = styled.div`
  width: 3.5rem;
  font-size: 0.9rem;
  opacity: 0.75;
  flex-shrink: 0;
`

const StackedBarTrack = styled.div`
  flex: 1;
  display: flex;
  gap: 2px;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
`

const StackedBarSegment = styled.div<{ $color: string; $pct: number }>`
  background: ${({ $color }) => $color};
  flex: ${({ $pct }) => `0 0 ${$pct}%`};
  min-width: ${({ $pct }) => ($pct > 0 ? '2px' : '0')};
`

const WinRateFigure = styled.div`
  width: 3.5rem;
  text-align: right;
  font-size: 0.95rem;
  font-weight: 700;
  flex-shrink: 0;
`

const TerminationColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`

const ColumnHeading = styled.div<{ $color: string }>`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
  margin-bottom: 0.5rem;
`

const TerminationRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 0.6rem;
`

const TerminationLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  opacity: 0.75;
`

const TerminationBarTrack = styled.div`
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
`

const TerminationBarFill = styled.div<{ $color: string; $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  min-width: ${({ $pct }) => ($pct > 0 ? '4px' : '0')};
  border-radius: 4px;
  background: ${({ $color }) => $color};
`

const EmptyNote = styled.p`
  font-size: 0.85rem;
  opacity: 0.5;
  margin: 0;
`

function TerminationList({
  slices,
  color,
  emptyLabel,
}: {
  slices: Array<TerminationSlice>
  color: string
  emptyLabel: string
}) {
  if (!slices.length) return <EmptyNote>{emptyLabel}</EmptyNote>

  return (
    <>
      {slices.map(({ category, count, pct }) => (
        <TerminationRow key={category} title={`${count} game${count === 1 ? '' : 's'}`}>
          <TerminationLabelRow>
            <span>{category}</span>
            <span>{Math.round(pct)}%</span>
          </TerminationLabelRow>
          <TerminationBarTrack>
            <TerminationBarFill $color={color} $pct={pct} />
          </TerminationBarTrack>
        </TerminationRow>
      ))}
    </>
  )
}

function WinRateBreakdown({
  games,
  username,
}: {
  games: Array<Game>
  username: string
}) {
  const stats = useMemo(
    () => calculateWinRateBreakdown(games, username),
    [games, username],
  )

  const { white, black } = stats.byColor

  return (
    <BreakdownGrid>
      <GraphCard>
        <SectionTitle>Win Rate by Color</SectionTitle>
        <LegendRow>
          <LegendSwatch $color={WIN_COLOR}>Win</LegendSwatch>
          <LegendSwatch $color={LOSS_COLOR}>Loss</LegendSwatch>
          <LegendSwatch $color={DRAW_COLOR}>Draw</LegendSwatch>
        </LegendRow>

        {[
          { label: 'White', record: white },
          { label: 'Black', record: black },
        ].map(({ label, record }) => (
          <ColorRow key={label}>
            <ColorLabel>{label}</ColorLabel>
            {record.totalGames === 0 ? (
              <EmptyNote>No games</EmptyNote>
            ) : (
              <>
                <StackedBarTrack
                  title={`${record.wins}W ${record.losses}L ${record.draws}D`}
                >
                  <StackedBarSegment
                    $color={WIN_COLOR}
                    $pct={(record.wins / record.totalGames) * 100}
                  />
                  <StackedBarSegment
                    $color={LOSS_COLOR}
                    $pct={(record.losses / record.totalGames) * 100}
                  />
                  <StackedBarSegment
                    $color={DRAW_COLOR}
                    $pct={(record.draws / record.totalGames) * 100}
                  />
                </StackedBarTrack>
                <WinRateFigure>{Math.round(record.winRatePct)}%</WinRateFigure>
              </>
            )}
          </ColorRow>
        ))}
      </GraphCard>

      <GraphCard>
        <SectionTitle>How Your Games End</SectionTitle>
        <TerminationColumns>
          <div>
            <ColumnHeading $color={WIN_COLOR}>Wins</ColumnHeading>
            <TerminationList
              slices={stats.winsByTermination}
              color={WIN_COLOR}
              emptyLabel="No wins yet"
            />
          </div>
          <div>
            <ColumnHeading $color={LOSS_COLOR}>Losses</ColumnHeading>
            <TerminationList
              slices={stats.lossesByTermination}
              color={LOSS_COLOR}
              emptyLabel="No losses yet"
            />
          </div>
        </TerminationColumns>
      </GraphCard>
    </BreakdownGrid>
  )
}

export default WinRateBreakdown
