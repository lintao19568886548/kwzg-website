const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000

function localParts(now) {
  const shifted = new Date(now.getTime() + SHANGHAI_OFFSET_MS)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
  }
}

function fromShanghaiParts(year, month, day) {
  return new Date(Date.UTC(year, month, day) - SHANGHAI_OFFSET_MS)
}

export function shanghaiDayBounds(now = new Date()) {
  const { year, month, day } = localParts(now)
  const start = fromShanghaiParts(year, month, day)
  const end = fromShanghaiParts(year, month, day + 1)
  return { start, end }
}

export function shanghaiMonthBounds(now = new Date()) {
  const { year, month } = localParts(now)
  return {
    start: fromShanghaiParts(year, month, 1),
    end: fromShanghaiParts(year, month + 1, 1),
  }
}

export function formatShanghaiDate(now = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(now)
}
