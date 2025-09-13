// Date utilities with timezone-robust operations using UTC

export function parseISODateUTC(ymd: string): Date {
  // ymd expected in YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) throw new Error(`Invalid ISO date: ${ymd}`)
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  return new Date(Date.UTC(y, mo - 1, d))
}

export function formatISODateUTC(d: Date): string {
  const y = d.getUTCFullYear()
  const m = `${d.getUTCMonth() + 1}`.padStart(2, '0')
  const da = `${d.getUTCDate()}`.padStart(2, '0')
  return `${y}-${m}-${da}`
}

export function addDaysUTC(d: Date, deltaDays: number): Date {
  const nd = new Date(d.getTime())
  nd.setUTCDate(nd.getUTCDate() + deltaDays)
  return nd
}

export function inclusiveDaySpanUTC(startYMD: string, endYMD: string): number {
  const s = parseISODateUTC(startYMD)
  const e = parseISODateUTC(endYMD)
  const msPerDay = 24 * 60 * 60 * 1000
  const diff = Math.floor((e.getTime() - s.getTime()) / msPerDay) + 1
  return diff
}

export function* iterateDateRangeUTC(startYMD: string, endYMD: string): Generator<{ ymd: string; index: number }> {
  const s = parseISODateUTC(startYMD)
  const e = parseISODateUTC(endYMD)
  let cur = new Date(s.getTime())
  let i = 0
  while (cur.getTime() <= e.getTime()) {
    yield { ymd: formatISODateUTC(cur), index: i }
    cur = addDaysUTC(cur, 1)
    i += 1
  }
}

