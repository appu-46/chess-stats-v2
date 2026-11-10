// Result colours, pill and side dot shared by game lists (the Games page
// and the profile's recent games).
import styled from 'styled-components'
import { FaHandshake, FaHeartBroken } from 'react-icons/fa'
import { GiTrophy } from 'react-icons/gi'
import { TbArrowUp } from 'react-icons/tb'

export type Result = 'win' | 'loss' | 'draw'

export const RESULT_COLORS: Record<Result, string> = {
  win: '#22c55e',
  loss: '#ef4444',
  draw: '#7f9cc9', // blue-grey: neutral, but distinct from the grey UI text
}

export const RESULT_LABELS: Record<Result, string> = {
  win: 'Win',
  loss: 'Loss',
  draw: 'Draw',
}

export const ResultPill = styled.span<{ $result: Result }>`
  justify-self: start;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 4.25rem;
  padding: 0.2rem 0.55rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ $result }) => RESULT_COLORS[$result]};
  background: color-mix(
    in srgb,
    ${({ $result }) => RESULT_COLORS[$result]} 14%,
    transparent
  );

  /* inherit: the global theme gives every span the page text colour. */
  & > span {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: inherit;
  }

  small {
    font-size: 0.68rem;
    font-weight: 600;
    opacity: 0.8;
    font-variant-numeric: tabular-nums;
  }
`

export function ResultIcon({ result }: { result: Result }) {
  const props = { size: 12, 'aria-hidden': true } as const
  if (result === 'win') return <GiTrophy {...props} />
  if (result === 'loss') return <FaHeartBroken {...props} />
  return <FaHandshake {...props} />
}

export const SideDot = styled.span<{ $side: 'white' | 'black' }>`
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $side }) => ($side === 'white' ? '#f4f4f4' : '#111')};
  box-shadow: 0 0 0 1px rgba(128, 128, 128, 0.8);
`

// ── Ratings in a game row ─────────────────────────────────────────────

// An opponent rated this far above the player gets a marker...
const RATING_GAP_SHOWN = 50
// ...and beating a player this far above, or losing to one this far
// below, is an upset.
const UPSET_GAP = 100

// `gap` is the opponent's rating minus the player's: positive means the
// opponent was the stronger one on paper. Only that direction is marked
// (a strong player's opponents are nearly all rated below them, which
// would put a marker on every row).
export function ratingGap(
  playerRating: string,
  opponentRating: string,
  result: Result,
) {
  const own = Number(playerRating)
  const theirs = Number(opponentRating)
  const gap = own && theirs ? theirs - own : 0
  return {
    gap,
    showGap: gap >= RATING_GAP_SHOWN,
    isUpset:
      (result === 'win' && gap >= UPSET_GAP) ||
      (result === 'loss' && gap <= -UPSET_GAP),
  }
}

const RatingChange = styled.span<{ $change: number }>`
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;

  && {
    opacity: 1;
    color: ${({ $change }) =>
      $change > 0
        ? RESULT_COLORS.win
        : $change < 0
          ? RESULT_COLORS.loss
          : 'inherit'};
  }
`

// Points the player won or lost in the game.
export function RatingChangeBadge({ change }: { change: number }) {
  return (
    <RatingChange $change={change} title="Rating change in this game">
      {change > 0 ? `+${change}` : change < 0 ? `−${-change}` : '±0'}
    </RatingChange>
  )
}

const RatingGap = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  && {
    opacity: 1;
    color: light-dark(#b45309, #f5b041);
  }
`

// How far above the player the opponent was rated.
export function RatingGapBadge({ gap }: { gap: number }) {
  return (
    <RatingGap title={`Opponent rated ${gap} higher`}>
      <TbArrowUp size={12} />
      {gap}
    </RatingGap>
  )
}

// A result that went against the ratings.
export const UpsetTag = styled.span<{ $result: Result }>`
  flex-shrink: 0;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: color-mix(
    in srgb,
    ${({ $result }) => RESULT_COLORS[$result]} 18%,
    transparent
  );

  && {
    opacity: 1;
    color: ${({ $result }) => RESULT_COLORS[$result]};
  }
`
