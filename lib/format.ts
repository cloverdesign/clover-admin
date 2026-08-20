/**
 * Presentation helpers for the API's `date-time` fields. The mock stores real
 * ISO dates (matching the Clover CMS API); components format them at render so
 * there are no hand-authored display strings or `ageDays`-style sort keys.
 */

/** Format an ISO date. `medium` → "Aug 1, 2024", `month` → "Aug 2024",
 * `compact` → "Aug 1". Formatted in UTC so date-only values don't drift. */
export function formatDate(
  iso: string | null | undefined,
  style: "medium" | "month" | "compact" = "medium"
): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const base: Intl.DateTimeFormatOptions =
    style === "month"
      ? { month: "short", year: "numeric" }
      : style === "compact"
        ? { month: "short", day: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" }
  return new Intl.DateTimeFormat("en-US", { ...base, timeZone: "UTC" }).format(d)
}

/** Sort comparator for ISO date strings, most-recent first. */
export function byNewest(a: string, b: string): number {
  return a < b ? 1 : a > b ? -1 : 0
}

/** Human relative time for activity feeds — "just now", "3d ago", "in 5d".
 * Falls back to an absolute date past ~30 days so old events stay legible. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—"
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "—"
  const diffMs = then - Date.now()
  const past = diffMs <= 0
  const mins = Math.round(Math.abs(diffMs) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return past ? `${mins}m ago` : `in ${mins}m`
  const hours = Math.round(mins / 60)
  if (hours < 24) return past ? `${hours}h ago` : `in ${hours}h`
  const days = Math.round(hours / 24)
  if (days <= 30) return past ? `${days}d ago` : `in ${days}d`
  return formatDate(iso, "compact")
}

/** Turn a date-only input value ("yyyy-mm-dd" from `<input type="date">`) into a
 * full ISO date-time the API's `date-time` fields require. Sending the bare date
 * is rejected as an invalid datetime. Empty or unparseable → undefined. */
export function toApiDateTime(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  const d = new Date(trimmed)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}
