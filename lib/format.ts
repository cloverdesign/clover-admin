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
