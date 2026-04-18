const TOKEN_REGEX = /YYYY|YY|MMMM|MMM|MM|M|dddd|ddd|DD|D|WW/g

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function formatDate(
  date: Date,
  format: string,
  t: (key: string) => string,
): string {
  const year    = date.getFullYear()
  const month   = date.getMonth()
  const day     = date.getDate()
  const weekday = date.getDay()
  const week    = isoWeek(date)

  return format.replace(TOKEN_REGEX, token => {
    switch (token) {
      case 'YYYY': return String(year)
      case 'YY':   return String(year).slice(-2)
      case 'MMMM': return t(`locale.months.${month}`)
      case 'MMM':  return t(`locale.monthsShort.${month}`)
      case 'MM':   return String(month + 1).padStart(2, '0')
      case 'M':    return String(month + 1)
      case 'dddd': return t(`locale.weekdays.${weekday}`)
      case 'ddd':  return t(`locale.weekdaysShort.${weekday}`)
      case 'DD':   return String(day).padStart(2, '0')
      case 'D':    return String(day)
      case 'WW':   return String(week).padStart(2, '0')
      default:     return token
    }
  })
}
