import styled from 'styled-components'
import { SiChessdotcom, SiLichess } from 'react-icons/si'
import { PLATFORM_LABELS } from '../helpers/platform'
import type { Platform } from '../helpers/platform'

// The platform's logo before its name. Kept neutral (no brand colour):
// chess.com's green would clash with the app's green and "win" green.

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid currentColor;
  opacity: 0.85;
  letter-spacing: 0.02em;
  white-space: nowrap;
`

function PlatformBadge({ platform }: { platform: Platform }) {
  const Logo = platform === 'lichess' ? SiLichess : SiChessdotcom
  return (
    <Badge>
      <Logo size={11} aria-hidden />
      {PLATFORM_LABELS[platform]}
    </Badge>
  )
}

export default PlatformBadge
