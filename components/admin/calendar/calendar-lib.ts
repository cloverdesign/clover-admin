/**
 * Pure helpers for the project calendar — the date math (visible range, axis
 * ticks, navigation), span geometry (positioning a start→end bar inside a range),
 * and project colour. Kept framework-free so the two views (timeline + grid) and
 * their tests share one source of truth. All week math starts on Monday.
 */

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  getQuarter,
  max as maxDate,
  min as minDate,
} from "date-fns"

import { PHASE_COLOR } from "@/lib/phase-colors"
import type { Project, MilestoneStatus } from "@/lib/api/models"

export type CalView = "timeline" | "grid"
export type Period = "day" | "week" | "month" | "quarter" | "year"

const WEEK = { weekStartsOn: 1 } as const

/** Which zoom levels each view supports (the header only offers these). */
export const VIEW_PERIODS: Record<CalView, Period[]> = {
  timeline: ["week", "month", "quarter", "year"],
  grid: ["day", "week", "month"],
}

export const PERIOD_LABEL: Record<Period, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
}

/** A project enriched with its client's name, ready for the calendar rows. */
export type CalProject = Project & { clientName: string }

/** A milestone flattened out of its project, ready to place on a date. */
export type CalMilestone = {
  id: string
  title: string
  dueDate: string
  status: MilestoneStatus
  projectId: string
  projectName: string
}

/** The visible window for an anchor date at a given zoom. */
export function rangeFor(anchor: Date, period: Period): { start: Date; end: Date } {
  switch (period) {
    case "day":
      return { start: startOfDay(anchor), end: endOfDay(anchor) }
    case "week":
      return { start: startOfWeek(anchor, WEEK), end: endOfWeek(anchor, WEEK) }
    case "month":
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) }
    case "quarter":
      return { start: startOfQuarter(anchor), end: endOfQuarter(anchor) }
    case "year":
      return { start: startOfYear(anchor), end: endOfYear(anchor) }
  }
}

/** Move the anchor one period forward (dir 1) or back (dir -1). */
export function stepAnchor(anchor: Date, period: Period, dir: 1 | -1): Date {
  switch (period) {
    case "day":
      return addDays(anchor, dir)
    case "week":
      return addWeeks(anchor, dir)
    case "month":
      return addMonths(anchor, dir)
    case "quarter":
      return addQuarters(anchor, dir)
    case "year":
      return addYears(anchor, dir)
  }
}

/** Human label for the current window, e.g. "March 2026" or "Q2 2026". */
export function rangeLabel(anchor: Date, period: Period): string {
  const { start, end } = rangeFor(anchor, period)
  switch (period) {
    case "day":
      return format(anchor, "EEEE, MMM d, yyyy")
    case "week":
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
    case "month":
      return format(anchor, "MMMM yyyy")
    case "quarter":
      return `Q${getQuarter(anchor)} ${format(anchor, "yyyy")}`
    case "year":
      return format(anchor, "yyyy")
  }
}

export type AxisTick = { date: Date; label: string; major: boolean }

/** Gridline + label positions for the timeline axis, scaled to the zoom. */
export function axisTicks(start: Date, end: Date, period: Period): AxisTick[] {
  if (period === "year") {
    return eachMonthOfInterval({ start, end }).map((date) => ({
      date,
      label: format(date, "MMM"),
      major: date.getMonth() === 0,
    }))
  }
  if (period === "quarter") {
    return eachWeekOfInterval({ start, end }, WEEK).map((date) => ({
      date,
      label: format(date, "MMM d"),
      major: date.getDate() <= 7,
    }))
  }
  // week + month → one tick per day
  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    label: format(date, period === "week" ? "EEE d" : "d"),
    major: date.getDay() === 1,
  }))
}

/** Fraction (0–100) of a date across the range; clamps outside to the edges. */
export function datePercent(date: Date, start: Date, end: Date): number {
  const total = end.getTime() - start.getTime()
  if (total <= 0) return 0
  const pct = ((date.getTime() - start.getTime()) / total) * 100
  return Math.max(0, Math.min(100, pct))
}

/** Left/width for a start→end span clamped to the range, or null if it doesn't
 * overlap the window at all. */
export function spanStyle(
  spanStart: Date,
  spanEnd: Date,
  start: Date,
  end: Date
): { left: string; width: string } | null {
  if (spanEnd.getTime() < start.getTime() || spanStart.getTime() > end.getTime()) {
    return null
  }
  const from = maxDate([spanStart, start])
  const to = minDate([spanEnd, end])
  const left = datePercent(from, start, end)
  const right = datePercent(to, start, end)
  return { left: `${left}%`, width: `${Math.max(right - left, 0.6)}%` }
}

/** Categorical colour for a project bar: phase-driven, muted once it's done or
 * cancelled so live work reads loudest. */
export function projectColor(project: Project): string {
  if (project.status === "CANCELLED") return "var(--color-neutral-300)"
  if (project.status === "COMPLETED") return "var(--color-neutral-400)"
  return (PHASE_COLOR as Record<string, string>)[project.phase] ?? "var(--color-lime-500)"
}

/** A project's effective span — falls back to a single-day marker when a date
 * is missing so it still appears on the calendar. */
export function projectSpan(project: Project): { start: Date; end: Date } | null {
  const start = project.startDate ? new Date(project.startDate) : null
  const end = project.endDate ? new Date(project.endDate) : null
  if (!start && !end) return null
  const s = start ?? end!
  const e = end ?? start!
  return { start: startOfDay(s), end: endOfDay(e < s ? s : e) }
}
