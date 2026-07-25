"use client"

import * as React from "react"

import { SpecimenGroup } from "@/components/playground/section"
import { useComputedTokens } from "@/components/playground/use-tokens"

// ─── Tier 1 · primitive ramps (authored oklch, mirrors globals.css) ─────────
const NEUTRAL: [string, string][] = [
  ["neutral-0", "oklch(1 0 0)"],
  ["neutral-50", "oklch(0.985 0 0)"],
  ["neutral-100", "oklch(0.97 0 0)"],
  ["neutral-200", "oklch(0.922 0 0)"],
  ["neutral-300", "oklch(0.87 0 0)"],
  ["neutral-400", "oklch(0.708 0 0)"],
  ["neutral-500", "oklch(0.556 0 0)"],
  ["neutral-600", "oklch(0.439 0 0)"],
  ["neutral-700", "oklch(0.371 0 0)"],
  ["neutral-800", "oklch(0.269 0 0)"],
  ["neutral-900", "oklch(0.205 0 0)"],
  ["neutral-950", "oklch(0.145 0 0)"],
]

const LIME: [string, string][] = [
  ["lime-50", "oklch(0.986 0.031 120.757)"],
  ["lime-100", "oklch(0.967 0.067 122.328)"],
  ["lime-200", "oklch(0.938 0.127 124.321)"],
  ["lime-300", "oklch(0.897 0.196 126.665)"],
  ["lime-400", "oklch(0.841 0.238 128.85)"],
  ["lime-500", "oklch(0.768 0.233 130.85)"],
  ["lime-600", "oklch(0.648 0.2 131.684)"],
  ["lime-700", "oklch(0.532 0.157 131.589)"],
  ["lime-800", "oklch(0.453 0.124 130.933)"],
  ["lime-900", "oklch(0.405 0.101 131.063)"],
  ["lime-950", "oklch(0.274 0.072 132.109)"],
]

const RED: [string, string][] = [
  ["red-50", "oklch(0.971 0.013 17.38)"],
  ["red-100", "oklch(0.936 0.032 17.717)"],
  ["red-200", "oklch(0.885 0.062 18.334)"],
  ["red-300", "oklch(0.808 0.114 19.571)"],
  ["red-400", "oklch(0.704 0.191 22.216)"],
  ["red-500", "oklch(0.637 0.237 25.331)"],
  ["red-600", "oklch(0.577 0.245 27.325)"],
  ["red-700", "oklch(0.505 0.213 27.518)"],
  ["red-800", "oklch(0.444 0.177 26.899)"],
  ["red-900", "oklch(0.396 0.141 25.723)"],
  ["red-950", "oklch(0.258 0.092 26.042)"],
]

const PRIMITIVE_OKLCH: Record<string, string> = Object.fromEntries([
  ...NEUTRAL,
  ...LIME,
  ...RED,
])

// ─── Tier 2 · semantic roles → primitive per theme ──────────────────────────
type Role = { role: string; light: string; dark: string }

const CORE: Role[] = [
  { role: "background", light: "neutral-0", dark: "neutral-950" },
  { role: "foreground", light: "neutral-950", dark: "neutral-50" },
  { role: "card", light: "neutral-0", dark: "neutral-900" },
  { role: "card-foreground", light: "neutral-950", dark: "neutral-50" },
  { role: "popover", light: "neutral-0", dark: "neutral-900" },
  { role: "popover-foreground", light: "neutral-950", dark: "neutral-50" },
  { role: "primary", light: "neutral-900", dark: "neutral-200" },
  { role: "primary-foreground", light: "neutral-50", dark: "neutral-900" },
  { role: "secondary", light: "neutral-100", dark: "neutral-800" },
  { role: "secondary-foreground", light: "neutral-900", dark: "neutral-50" },
  { role: "muted", light: "neutral-100", dark: "neutral-800" },
  { role: "muted-foreground", light: "neutral-500", dark: "neutral-400" },
  { role: "accent", light: "neutral-100", dark: "neutral-800" },
  { role: "accent-foreground", light: "neutral-900", dark: "neutral-50" },
  { role: "destructive", light: "red-600", dark: "red-400" },
  { role: "border", light: "neutral-200", dark: "neutral-0 / 10%" },
  { role: "input", light: "neutral-200", dark: "neutral-0 / 15%" },
  { role: "ring", light: "neutral-400", dark: "neutral-500" },
  { role: "overlay", light: "neutral-950", dark: "neutral-950" },
]

const CHART: Role[] = [
  { role: "chart-1", light: "lime-300", dark: "lime-300" },
  { role: "chart-2", light: "lime-500", dark: "lime-500" },
  { role: "chart-3", light: "lime-600", dark: "lime-600" },
  { role: "chart-4", light: "lime-700", dark: "lime-700" },
  { role: "chart-5", light: "lime-800", dark: "lime-800" },
]

const SIDEBAR: Role[] = [
  { role: "sidebar", light: "neutral-50", dark: "neutral-900" },
  { role: "sidebar-foreground", light: "neutral-950", dark: "neutral-50" },
  { role: "sidebar-primary", light: "neutral-900", dark: "neutral-200" },
  { role: "sidebar-primary-foreground", light: "neutral-50", dark: "neutral-900" },
  { role: "sidebar-accent", light: "neutral-100", dark: "neutral-800" },
  { role: "sidebar-accent-foreground", light: "neutral-900", dark: "neutral-50" },
  { role: "sidebar-border", light: "neutral-200", dark: "neutral-0 / 10%" },
  { role: "sidebar-ring", light: "neutral-400", dark: "neutral-500" },
]

const ALL_VARS = [
  ...[...NEUTRAL, ...LIME, ...RED].map(([n]) => `--color-${n}`),
  ...[...CORE, ...CHART, ...SIDEBAR].map((r) => `--${r.role}`),
]

function useIsDark() {
  const [dark, setDark] = React.useState(false)
  React.useEffect(() => {
    const read = () =>
      setDark(document.documentElement.classList.contains("dark"))
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])
  return dark
}

export function ColorsSection() {
  const lab = useComputedTokens(ALL_VARS)
  const isDark = useIsDark()

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="mb-4 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Primitives
        </div>
        <div className="flex flex-col gap-6">
          <Ramp label="Neutral" ramp={NEUTRAL} lab={lab} />
          <Ramp label="Lime · brand" ramp={LIME} lab={lab} />
          <Ramp label="Red · danger" ramp={RED} lab={lab} />
        </div>
      </div>

      <div>
        <div className="mb-4 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Semantic roles
        </div>
        <div className="flex flex-col gap-6">
          <SpecimenGroup label="Core">
            <RoleGrid roles={CORE} lab={lab} isDark={isDark} />
          </SpecimenGroup>
          <SpecimenGroup label="Chart">
            <RoleGrid roles={CHART} lab={lab} isDark={isDark} />
          </SpecimenGroup>
          <SpecimenGroup label="Sidebar">
            <RoleGrid roles={SIDEBAR} lab={lab} isDark={isDark} />
          </SpecimenGroup>
        </div>
      </div>
    </div>
  )
}

function Ramp({
  label,
  ramp,
  lab,
}: {
  label: string
  ramp: [string, string][]
  lab: Record<string, string>
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium">{label}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {ramp.map(([name, oklch]) => (
          <div key={name} className="overflow-hidden rounded-lg border bg-card">
            <div
              className="h-10 w-full border-b"
              style={{ background: `var(--color-${name})` }}
            />
            <div className="space-y-0.5 p-2">
              <div className="font-mono text-[11px] font-medium">{name}</div>
              <div className="font-mono text-[9px] text-muted-foreground">
                {oklch}
              </div>
              <div
                className="truncate font-mono text-[9px] text-muted-foreground/70"
                title={lab[`--color-${name}`]}
              >
                {lab[`--color-${name}`] || "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoleGrid({
  roles,
  lab,
  isDark,
}: {
  roles: Role[]
  lab: Record<string, string>
  isDark: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {roles.map(({ role, light, dark }) => {
        const ref = isDark ? dark : light
        const oklch = PRIMITIVE_OKLCH[ref]
        return (
          <div key={role} className="overflow-hidden rounded-xl border bg-card">
            <div
              className="h-12 w-full border-b"
              style={{ background: `var(--${role})` }}
            />
            <div className="space-y-0.5 p-2.5">
              <div className="font-mono text-xs font-medium">{role}</div>
              <div className="font-mono text-[10px] text-lime-700 dark:text-lime-500">
                → {ref}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground">
                {oklch ?? "mix"}
              </div>
              <div
                className="truncate font-mono text-[9px] text-muted-foreground/70"
                title={lab[`--${role}`]}
              >
                {lab[`--${role}`] || "—"}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
