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

  const formattedDate = `${year}-${month}`
  return { formattedDate, entireDate, year, month }
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
