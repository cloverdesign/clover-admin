import { describe, expect, it, vi, afterEach } from "vitest"

import { byNewest, formatDate, formatRelative, toApiDateTime } from "@/lib/format"

afterEach(() => {
  vi.useRealTimers()
})

describe("formatDate", () => {
  it("formats in UTC so date-only values don't drift backwards", () => {
    // The API sends midnight UTC. Formatted in a negative-offset local zone
    // this would render as the previous day — the reason the helper pins UTC.
    expect(formatDate("2026-08-18T00:00:00.000Z")).toBe("Aug 18, 2026")
    expect(formatDate("2026-01-01T00:00:00.000Z", "compact")).toBe("Jan 1")
    expect(formatDate("2026-01-01T00:00:00.000Z", "month")).toBe("Jan 2026")
  })

  it("renders an em dash for absent or unparseable input", () => {
    expect(formatDate(null)).toBe("—")
    expect(formatDate(undefined)).toBe("—")
    expect(formatDate("")).toBe("—")
    expect(formatDate("not a date")).toBe("—")
  })
})

describe("byNewest", () => {
  it("sorts most-recent first", () => {
    const sorted = ["2026-01-01", "2026-08-01", "2026-03-01"].sort(byNewest)
    expect(sorted).toEqual(["2026-08-01", "2026-03-01", "2026-01-01"])
  })
})

describe("formatRelative", () => {
  it("distinguishes past from future", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-28T12:00:00.000Z"))

    expect(formatRelative("2026-08-28T11:00:00.000Z")).toBe("1h ago")
    expect(formatRelative("2026-08-28T13:00:00.000Z")).toBe("in 1h")
    expect(formatRelative("2026-08-25T12:00:00.000Z")).toBe("3d ago")
    expect(formatRelative("2026-08-31T12:00:00.000Z")).toBe("in 3d")
  })

  it("falls back to an absolute date past ~30 days, so old events stay legible", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-28T12:00:00.000Z"))

    // The minute count is rounded, so "just now" ends at 30s, not 60s.
    expect(formatRelative("2026-08-28T11:59:41.000Z")).toBe("just now")
    expect(formatRelative("2026-08-28T11:59:29.000Z")).toBe("1m ago")
    expect(formatRelative("2026-01-15T12:00:00.000Z")).toBe("Jan 15")
  })
})

describe("toApiDateTime", () => {
  it("expands a date input's yyyy-mm-dd into a full ISO timestamp", () => {
    // The API rejects a bare date as an invalid datetime — this is what stopped
    // invoice drafts from being created.
    expect(toApiDateTime("2026-09-01")).toBe("2026-09-01T00:00:00.000Z")
  })

  it("returns undefined for empty or unparseable values, never a bad string", () => {
    expect(toApiDateTime("")).toBeUndefined()
    expect(toApiDateTime("   ")).toBeUndefined()
    expect(toApiDateTime(null)).toBeUndefined()
    expect(toApiDateTime(undefined)).toBeUndefined()
    expect(toApiDateTime("not a date")).toBeUndefined()
  })
})
