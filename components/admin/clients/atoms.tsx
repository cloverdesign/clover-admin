"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PHASE_COLOR } from "@/lib/phase-colors"
import { useSiteCurrency } from "@/hooks/use-site-currency"
import {
  type Client,
  type ClientStatus,
  CLIENT_STATUS_LABEL,
  clientTotalValue,
  formatMoney,
} from "@/lib/mock/clients"

/** Deterministic accent per company, drawn from our categorical ramps. */
const MONOGRAM_PALETTE = [
  "var(--color-violet-400)",
  "var(--color-lime-500)",
  "var(--color-amber-400)",
  "var(--color-red-400)",
  "var(--color-neutral-400)",
]

function paletteIndex(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h) % MONOGRAM_PALETTE.length
}

/** The deterministic accent color for a company (CSS var string). */
export function monogramColor(company: string): string {
  return MONOGRAM_PALETTE[paletteIndex(company)]
}

function initials(company: string): string {
  const words = company.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function Monogram({
  company,
  className,
}: {
  company: string
  className?: string
}) {
  const color = MONOGRAM_PALETTE[paletteIndex(company)]
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
        className
      )}
      style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
    >
      {initials(company)}
    </span>
  )
}

const STATUS_DOT: Record<ClientStatus, string> = {
  LEAD: "var(--color-violet-400)",
  ONBOARDING: "var(--color-amber-400)",
  ACTIVE: "var(--color-lime-500)",
  ON_HOLD: "var(--color-neutral-400)",
  CHURNED: "var(--color-neutral-300)",
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge variant="secondary" className="gap-1.5">
      <span
        className="size-1.5 rounded-full"
        style={{ background: STATUS_DOT[status] }}
      />
      {CLIENT_STATUS_LABEL[status]}
    </Badge>
  )
}

/** A row of dots, one per project, colored by phase — a client's work at a glance. */
export function PhaseDots({
  client,
  className,
}: {
  client: Client
  className?: string
}) {
  if (!client.projects.length) {
    return <span className="text-xs text-muted-foreground/60">No projects</span>
  }
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {client.projects.map((p) => (
        <span
          key={p.id}
          title={`${p.name} · ${p.phase}`}
          className={cn(
            "size-2 rounded-full",
            p.status === "completed" && "opacity-40"
          )}
          style={{ background: PHASE_COLOR[p.phase] }}
        />
      ))}
    </span>
  )
}

/**
 * Money in the studio's display currency (top-nav picker). Returns the code and
 * a helper for a client's rolled-up total. Aggregates convert per-project — no
 * live rates (see currencies mock).
 */
export function useDisplayMoney() {
  const [display] = useSiteCurrency()
  return React.useMemo(
    () => ({
      display,
      total: (client: Client) =>
        formatMoney(clientTotalValue(client, display), display),
    }),
    [display]
  )
}
