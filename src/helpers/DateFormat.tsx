import dayjs from 'dayjs'

export function formatDate(ts: number) {
  const date = dayjs(ts * 1000)
  const formattedDateTime = date.format('DD-MMM-YYYY HH:mm:ss')
  const formattedDate = date.format('YYYY-MM-DD')

  return { formattedDateTime, formattedDate }
}

export function queryFormatDate(ts: string) {
  const [year, month, day] = ts.split('.')

  const entireDate = new Date(`${year}-${month}-${day}`).toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )
  const yearMonth = new Date(`${year}-${month}-${day}`).toLocaleDateString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    },
  )

  const formattedDate = `${year} ${month}`
  return { formattedDate, entireDate, year, month, yearMonth }
}

export function formatGameDateList(dateStr: string): string {
  const [datePart, timePart] = dateStr.split(' ')
  const [day, month, year] = datePart.split('-')

  const fullYear = `20${year}`
  const date = new Date(`${fullYear}-${month}-${day}`)

  const formattedDate = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return `${formattedDate} ${timePart}`
}

// Day keys are 'YYYY.MM.DD' (game end date). Built from parts rather than
// `new Date(key)`, whose parsing of the dotted form varies by browser.
export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split('.').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDay(seconds: number) {
  return new Date(seconds * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// "12 min ago", "5 hours ago", "6 days ago", then a plain date.
export function formatLastActive(seconds: number) {
  const elapsed = Math.max(0, Date.now() / 1000 - seconds)
  const minutes = Math.floor(elapsed / 60)
  const hours = Math.floor(elapsed / 3600)
  const days = Math.floor(elapsed / 86400)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return formatDay(seconds)
}
