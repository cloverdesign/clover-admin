import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Folder01Icon,
  DollarCircleIcon,
  Invoice01Icon,
  Alert02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardKpi, Delta } from "@/lib/mock/dashboard"

/** Vertical bar sparkline — the accent mini-chart on ui-test7 KPI cards. */
export function MiniBars({
  values,
  accent = "bg-primary",
  className,
}: {
  values: number[]
  accent?: string
  className?: string
}) {
  const max = Math.max(...values, 1)
  return (
    <div className={cn("flex h-9 items-end gap-0.5", className)} aria-hidden>
      {values.map((v, i) => (
        <div
          key={i}
          className={cn("anim-grow w-1 rounded-full", accent)}
          style={{
            height: `${Math.max(10, (v / max) * 100)}%`,
            animationDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </div>
  )
}

/** Up/down delta pill; green when the movement is good, red otherwise. */
export function DeltaBadge({ delta }: { delta: Delta }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        delta.good
          ? "bg-lime-500/10 text-lime-700 dark:text-lime-400"
          : "bg-destructive/10 text-destructive"
      )}
    >
      <HugeiconsIcon
        icon={delta.direction === "up" ? ArrowUp01Icon : ArrowDown01Icon}
        className="size-3"
      />
      {delta.label}
    </span>
  )
}

const KPI_ICON = {
  projects: Folder01Icon,
  revenue: DollarCircleIcon,
  outstanding: Invoice01Icon,
  attention: Alert02Icon,
} as const

const ACCENT_BAR = {
  lime: "bg-lime-500",
  red: "bg-destructive",
  neutral: "bg-muted-foreground/60",
} as const

/** KPI card: icon + title + overflow, big mono value + unit, accent sparkline,
 * delta footer. Modelled on ui-test7.jpg. */
export function StatCard({ kpi }: { kpi: DashboardKpi }) {
  const icon = KPI_ICON[kpi.key as keyof typeof KPI_ICON] ?? Folder01Icon
  return (
    <Card className="gap-0">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href={kpi.href}
            className="flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <HugeiconsIcon icon={icon} className="size-4 text-muted-foreground" />
            {kpi.label}
          </Link>
          <button
            type="button"
            aria-label="More"
            className="-mr-1 flex size-6 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
          </button>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {kpi.value}
            </span>
            {kpi.unit && (
              <span className="text-lg text-muted-foreground">{kpi.unit}</span>
            )}
          </div>
          <MiniBars values={kpi.bars} accent={ACCENT_BAR[kpi.accent]} />
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <DeltaBadge delta={kpi.delta} />
          <span className="truncate">{kpi.footer}</span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Section wrapper: header with leading icon + title, an optional action node,
 * and an overflow affordance — then the body. Matches the panel headers in
 * ui-test7 ("Endpoint Traffic & Health", "Active Pipeline Architecture", …).
 */
export function PanelCard({
  icon,
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  icon: typeof Folder01Icon
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <HugeiconsIcon icon={icon} className="size-4 text-muted-foreground" />
        <h3 className="font-heading flex-1 text-sm font-medium">{title}</h3>
        {action}
        <button
          type="button"
          aria-label="More"
          className="-mr-1 flex size-6 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
        </button>
      </div>
      <div className={cn("flex flex-1 flex-col p-5", bodyClassName)}>
        {children}
      </div>
    </Card>
  )
}

/** Muted label left, mono value right — the key/value rows in ui-test7 panels. */
export function KeyValueRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}
