export function formatDate(ts: number): string {
  const date = new Date(ts * 1000)

  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0') // months are 0-based
  const yy = String(date.getFullYear()).slice(-2)

  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')

  const result = `${dd}-${mm}-${yy} ${hh}:${min}:${ss}`

  return result
}
