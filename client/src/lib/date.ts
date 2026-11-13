export function todayIso(): string {
  return localDateKey(new Date())
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function shiftDays(dateIso: string, days: number): string {
  const date = new Date(`${dateIso}T12:00:00`)
  date.setDate(date.getDate() + days)
  return localDateKey(date)
}

export function formatDate(dateIso: string | null | undefined): string {
  if (!dateIso) return '-'
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${dateIso}T00:00:00`))
  } catch {
    return dateIso
  }
}

export function defaultInsightsWindow(): { fromDate: string; toDate: string } {
  const toDate = todayIso()
  const fromDate = shiftDays(toDate, -29)
  return { fromDate, toDate }
}
