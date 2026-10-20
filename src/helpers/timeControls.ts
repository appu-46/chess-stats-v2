import { FaChessKnight, FaStopwatch, FaSun } from 'react-icons/fa'
import { GiBulletBill } from 'react-icons/gi'
import { SiStackblitz } from 'react-icons/si'
import type { IconType } from 'react-icons'
import type { Platform } from './platform'

export interface TimeControlConfig {
  // Matches the per-game `time_class` (chess.com) / `speed` (lichess), and the
  // key used in normalized PlayerStats.
  timeClass: string
  label: string
  color: string
  icon: IconType
}

const BLITZ: TimeControlConfig = {
  timeClass: 'blitz',
  label: 'Blitz',
  color: '#f59e0b',
  icon: SiStackblitz,
}
const RAPID: TimeControlConfig = {
  timeClass: 'rapid',
  label: 'Rapid',
  color: '#ef4444',
  icon: FaStopwatch,
}
const BULLET: TimeControlConfig = {
  timeClass: 'bullet',
  label: 'Bullet',
  color: '#3b82f6',
  icon: GiBulletBill,
}

// Order matters: it's the tab order on Dashboard/Stats/Profile and the
// fixed series order (and therefore color assignment) on multi-series charts.
export const TIME_CONTROLS: Record<Platform, Array<TimeControlConfig>> = {
  'chess.com': [
    BLITZ,
    RAPID,
    BULLET,
    { timeClass: 'daily', label: 'Daily', color: '#22c55e', icon: FaSun },
  ],
  lichess: [
    BLITZ,
    RAPID,
    BULLET,
    {
      timeClass: 'classical',
      label: 'Classical',
      color: '#a855f7',
      icon: FaChessKnight,
    },
    {
      timeClass: 'correspondence',
      label: 'Correspondence',
      color: '#22c55e',
      icon: FaSun,
    },
  ],
}

export function getTimeControls(platform: Platform) {
  return TIME_CONTROLS[platform]
}
