import { cn } from "@/lib/utils"

/**
 * The shape every portal sub page fills: an editorial hero, then a toolbar row
 * that pins under the header as the content scrolls.
 *
 * Before this the four sub pages each invented their own header — Files put
 * filter pills under the title, Invoices a summary card, Requests an action
 * button, Projects nothing — and all four repeated the title the chrome
 * breadcrumb had already shown. One scaffold, one place to change it.
 *
 * The toolbar is deliberately loose about its contents: the pages need
 * different things in it (project filters, a count, a primary action), and the
 * only rule is left-aligned controls with `meta` and `action` pushed right.
 */
export function PortalPage({
  title,
  subtitle,
  summary,
  toolbar,
  meta,
  action,
  children,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Extra hero content below the subtitle — progress, status, anything that
   * belongs to the page rather than to its current filter. Scrolls away. */
  summary?: React.ReactNode
  /** Left-aligned toolbar controls: filter pills, tabs, segments. */
  toolbar?: React.ReactNode
  /** Right-aligned count or status text, before the action. */
  meta?: React.ReactNode
  /** The page's primary action, pinned to the toolbar's right edge. */
  action?: React.ReactNode
  children: React.ReactNode
}) {
  const hasToolbar = Boolean(toolbar || meta || action)

  return (
    <div className="flex flex-col">
      <div className="pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
        {summary && <div className="mt-4">{summary}</div>}
      </div>

      {hasToolbar && (
        <div
          className={cn(
            // Full-bleed into the canvas gutters so the pinned row reads as a
            // rule across the page, not a floating strip inside the content.
            // It pins flush to the canvas top because `main` carries no vertical
            // padding — see the shell.
            "sticky top-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-b border-border bg-background px-4 py-3 sm:-mx-6 sm:px-6"
          )}
        >
          {toolbar}
          {(meta || action) && (
            <div className="ml-auto flex items-center gap-3">
              {meta && (
                <span className="text-xs text-muted-foreground tabular-nums">{meta}</span>
              )}
              {action}
            </div>
          )}
        </div>
      )}

      <div className={cn("flex flex-col gap-4", hasToolbar ? "pt-4" : "pt-0")}>
        {children}
      </div>
    </div>
  )
}

/** Toolbar filter pill — the shared control for "which slice of this list". */
export function PortalFilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
        active
          ? "bg-secondary font-medium text-secondary-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
