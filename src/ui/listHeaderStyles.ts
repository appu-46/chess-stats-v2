import { css } from 'styled-components'

// The column names above a list of rows (leaderboard, games, recent
// games): a faint brand-tinted bar, so they read as a header rather than
// a stray row of grey text. Each list adds its own grid columns and
// side padding. The outline is an inset shadow, not a border, to keep the
// columns lined up with the rows below.
export const listHeaderStyles = css`
  margin-bottom: 0.4rem;
  border-radius: 10px;
  background: light-dark(rgba(52, 163, 126, 0.08), rgba(110, 231, 183, 0.06));
  box-shadow: inset 0 0 0 1px
    light-dark(rgba(52, 163, 126, 0.2), rgba(110, 231, 183, 0.12));
  color: light-dark(var(--brand), var(--brand-soft));
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`
