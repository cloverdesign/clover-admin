"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { ActiveProject, Phase } from "@/lib/mock/dashboard"
import { PHASE_COLOR, PHASE_ORDER } from "@/lib/phase-colors"

type Datum = { phase: Phase; count: number; fill: string }

function phaseData(projects: ActiveProject[]): Datum[] {
  return PHASE_ORDER.map((phase) => ({
    phase,
    count: projects.filter((p) => p.phase === phase).length,
    fill: PHASE_COLOR[phase],
  })).filter((d) => d.count > 0)
}

/** Count from 0 to `target` on mount (eased). Honors reduced-motion. */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = React.useState(0)
  React.useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (reduce) {
      setValue(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function PhaseLegend({
  data,
  hovered,
  onHover,
}: {
  data: Datum[]
  hovered: number | null
  onHover: (i: number | null) => void
}) {
  return (
    <div className="flex w-full flex-col gap-0.5">
      {data.map((d, i) => (
        <div
          key={d.phase}
          onMouseEnter={() => onHover(i)}
          onMouseLeave={() => onHover(null)}
          className={cn(
            "flex cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors",
            hovered === i && "bg-muted"
          )}
        >
          <span
            className="size-2 shrink-0 rounded-full transition-opacity"
            style={{
              background: d.fill,
              opacity: hovered !== null && hovered !== i ? 0.35 : 1,
            }}
          />
          <span className="flex-1 truncate text-muted-foreground">{d.phase}</span>
          <span className="font-mono text-foreground">{d.count}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Segmented radial-tick gauge (ui-test10 style): a semicircle of thin ticks,
 * allocated per phase and colored distinctly, total near the base. Hovering a
 * phase's ticks (or its legend row) highlights it and shows its count in the
 * center. Hand-rolled SVG — deterministic (SSR-safe) and never clips.
 */
export function PhaseGauge({ projects }: { projects: ActiveProject[] }) {
  const data = phaseData(projects)
  const total = projects.length
  const TICKS = 44

  // Allocate ticks per phase proportionally, distributing the remainder to the
  // largest fractional parts so they always sum to TICKS (a full semicircle).
  const raw = data.map((d) => (d.count / Math.max(total, 1)) * TICKS)
  const alloc = raw.map((r) => Math.floor(r))
  const remainder = TICKS - alloc.reduce((a, b) => a + b, 0)
  const byFrac = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)
  for (let k = 0; k < remainder; k++) alloc[byFrac[k % byFrac.length].i]++

  // Which phase each tick belongs to (index into `data`).
  const tickPhase: number[] = []
  data.forEach((d, i) => {
    for (let j = 0; j < alloc[i]; j++) tickPhase.push(i)
  })

  const [hovered, setHovered] = React.useState<number | null>(null)

  const W = 240
  const H = 140
  const cx = W / 2
  const cy = 128
  const rInner = 86
  const rOuter = 116

  const rad = (deg: number) => (deg * Math.PI) / 180
  const angleAt = (t: number) => 180 + (t / TICKS) * 180
  // Round so server (Node) and client (browser) emit identical coordinate
  // strings — Math.cos/sin can differ in the last float digit across engines,
  // which would otherwise trip a hydration mismatch on this client component.
  const q = (n: number) => Math.round(n * 100) / 100

  const animatedTotal = useCountUp(total)
  const centerValue =
    hovered !== null ? String(data[hovered].count) : String(animatedTotal)
  const centerLabel = hovered !== null ? data[hovered].phase : "projects"

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-[300px]"
          role="img"
          aria-label={`${total} projects across phases`}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Visible ticks */}
          {tickPhase.map((phaseIdx, i) => {
            const a = rad(angleAt(i + 0.5))
            const dim = hovered !== null && hovered !== phaseIdx
            return (
              <line
                key={i}
                x1={q(cx + rInner * Math.cos(a))}
                y1={q(cy + rInner * Math.sin(a))}
                x2={q(cx + rOuter * Math.cos(a))}
                y2={q(cy + rOuter * Math.sin(a))}
                stroke={data[phaseIdx].fill}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={30}
                className="anim-tick"
                style={{
                  opacity: dim ? 0.18 : 1,
                  transition: "opacity 150ms ease",
                  animationDelay: `${i * 14}ms`,
                }}
              />
            )
          })}

          {/* Center readout — sits low, near the base of the ticks */}
          <text
            x={cx}
            y={cy - 22}
            textAnchor="middle"
            className="pointer-events-none fill-foreground text-[32px] font-semibold tabular-nums"
          >
            {centerValue}
          </text>
          <text
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            className="pointer-events-none fill-muted-foreground text-[10px]"
          >
            {centerLabel}
          </text>

          {/* Invisible wide hit lines — one per tick — for easy per-phase hover */}
          {tickPhase.map((phaseIdx, i) => {
            const a = rad(angleAt(i + 0.5))
            return (
              <line
                key={`hit-${i}`}
                x1={q(cx + (rInner - 8) * Math.cos(a))}
                y1={q(cy + (rInner - 8) * Math.sin(a))}
                x2={q(cx + (rOuter + 4) * Math.cos(a))}
                y2={q(cy + (rOuter + 4) * Math.sin(a))}
                stroke="transparent"
                strokeWidth={10}
                pointerEvents="stroke"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(phaseIdx)}
              />
            )
          })}
        </svg>
      </div>

      <div className="border-t border-border px-4 py-3">
        <PhaseLegend data={data} hovered={hovered} onHover={setHovered} />
      </div>
    </div>
  )
}
