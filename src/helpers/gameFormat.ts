// "Hikaru won by resignation" -> "Resignation"; the result pill already
// says who won.
export function shortTermination(text: string): string {
  if (!text) return '—'
  if (/on time/i.test(text)) return 'Timeout'
  const reason = /\bby\s+(.+)$/i.exec(text)?.[1]
  if (!reason) return text
  return reason.charAt(0).toUpperCase() + reason.slice(1)
}

// "180+2" -> "3+2", "60" -> "1+0", "1/86400" or "1d" -> "1 day".
export function formatTimeControl(raw: string): string {
  if (!raw || raw === '-') return '—'
  const daily = /^1\/(\d+)$/.exec(raw)
  if (daily) {
    const days = Math.round(Number(daily[1]) / 86400)
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }
  const lichessDaily = /^(\d+)d$/.exec(raw)
  if (lichessDaily) {
    const days = Number(lichessDaily[1])
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }
  const [base, increment = '0'] = raw.split('+')
  const seconds = Number(base)
  if (!Number.isFinite(seconds)) return raw
  const minutes = seconds / 60
  const label = Number.isInteger(minutes) ? String(minutes) : minutes.toFixed(1)
  return `${label}+${increment}`
}
