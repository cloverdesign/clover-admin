import { cn } from "@/lib/utils"
import { TabsTrigger } from "@/components/ui/tabs"

/**
 * The shape every portal sub page fills.
 *
 * Deliberately flat: one header row carrying the title, the record count and
 * the primary action, then the page's tabs, then the table. An earlier version
 * led with a large title and a subtitle above a toolbar, which spent ~90px
 * before any data — the pattern across shipped dashboards (Attio, Deel,
 * Acctual, Navattic, PayPal) is a single compact row instead, with the count
 * folded into the tab labels rather than given a slot of its own.
 */
export function PortalPage({
  title,
  count,
  action,
  stats,
  tabs,
  children,
}: {
  title: React.ReactNode
  /** Shown beside the title, quiet. Ignored when `tabs` is set. */
  count?: number
  /** The page's primary action, right-aligned on the title row. */
  action?: React.ReactNode
  /** A thin figures row between the title and the tabs. No card. */
  stats?: React.ReactNode
  /** A `TabsList` — the caller owns the `Tabs` root so panels stay in scope. */
  tabs?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {/* Only when there are no tabs — tab labels already carry counts, and
            showing both puts the same number on screen twice. */}
        {count != null && !tabs && (
          <span className="text-sm text-muted-foreground tabular-nums">{count}</span>
        )}
        {action && <div className="ml-auto">{action}</div>}
      </div>

      {stats && <div className="mt-3">{stats}</div>}

      {tabs && <div className="mt-4 border-b border-border pb-px">{tabs}</div>}

      <div className={cn("flex flex-col", tabs ? "pt-1" : "pt-4")}>{children}</div>
    </div>
  )
}

/** A tab whose count sits in the label, the way the reference dashboards do it —
 * so the count reads as "how many of these" rather than a page-level statistic. */
export function PortalTab({
  value,
  count,
  children,
}: {
  value: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <TabsTrigger value={value}>
      {children}
      {count != null && count > 0 && (
        <span className="ml-1.5 text-xs tabular-nums opacity-60">{count}</span>
      )}
    </TabsTrigger>
  )
}

/** Quiet inline figures — the alternative to a summary card above a list. */
export function PortalStats({
  items,
}: {
  items: { label: string; value: string; tone?: string }[]
}) {
  return (
    <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd
            className={cn(
              "font-mono text-sm font-medium tabular-nums",
              item.tone
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** Row count under a table, the way the references close a list. */
export function PortalTableFooter({ children }: { children: React.ReactNode }) {
  return <p className="px-1 pt-3 text-xs text-muted-foreground">{children}</p>
}
