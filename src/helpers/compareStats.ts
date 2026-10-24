import type { PlayerStats, TimeControlStat } from './normalizePlayer'
import type { TimeControlConfig } from './timeControls'

export type Side = 'a' | 'b'

export interface CompareMetric {
  key: 'current' | 'peak' | 'winRate' | 'games'
  label: string
  a: number | null
  b: number | null
  // Whose number is higher; null on a tie or when either is missing.
  leader: Side | null
}

export interface CompareBlock {
  control: TimeControlConfig
  metrics: Array<CompareMetric>
}

function gamesPlayed(stat: TimeControlStat | undefined): number | null {
  if (!stat) return null
  const { win, loss, draw } = stat.record
  return win + loss + draw
}

function winRate(stat: TimeControlStat | undefined): number | null {
  const games = gamesPlayed(stat)
  if (!stat || !games) return null
  return (stat.record.win / games) * 100
}

function leaderOf(a: number | null, b: number | null): Side | null {
  if (a == null || b == null || a === b) return null
  return a > b ? 'a' : 'b'
}

function metric(
  key: CompareMetric['key'],
  label: string,
  a: number | null,
  b: number | null,
): CompareMetric {
  return { key, label, a, b, leader: leaderOf(a, b) }
}

// Time controls of both players' platforms, A's order first, each once.
// Players on different sites share blitz/rapid/bullet; the rest are one
// site's only (chess.com daily, lichess classical), and show "—" for the
// other player.
export function mergeTimeControls(
  a: Array<TimeControlConfig>,
  b: Array<TimeControlConfig>,
): Array<TimeControlConfig> {
  const seen = new Set(a.map((control) => control.timeClass))
  return [...a, ...b.filter((control) => !seen.has(control.timeClass))]
}

// One block per time control either player has played, comparing their
// current and peak ratings, win rate and games played.
export function compareStats(
  statsA: PlayerStats | undefined,
  statsB: PlayerStats | undefined,
  controls: Array<TimeControlConfig>,
): Array<CompareBlock> {
  const blocks: Array<CompareBlock> = []
  for (const control of controls) {
    const a = statsA?.[control.timeClass]
    const b = statsB?.[control.timeClass]
    if (!a && !b) continue
    blocks.push({
      control,
      metrics: [
        metric('current', 'Current', a?.current ?? null, b?.current ?? null),
        metric(
          'peak',
          'Peak',
          a?.best?.rating ?? null,
          b?.best?.rating ?? null,
        ),
        metric('winRate', 'Win rate', winRate(a), winRate(b)),
        metric('games', 'Games', gamesPlayed(a), gamesPlayed(b)),
      ],
    })
  }
  return blocks
}
