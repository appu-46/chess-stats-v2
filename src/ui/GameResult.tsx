// Result colours, pill and side dot shared by game lists (the Games page
// and the profile's recent games).
import styled from 'styled-components'
import { FaHandshake, FaHeartBroken } from 'react-icons/fa'
import { GiTrophy } from 'react-icons/gi'

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
