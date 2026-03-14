export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function shiftDays(dateIso: string, days: number): string {
  const date = new Date(`${dateIso}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
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
