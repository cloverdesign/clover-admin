import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"

import { cn } from "@/lib/utils"

/**
 * The studio's one empty-state pattern. Two variants cover every surface:
 *
 * - `default` — the prominent, centered state: an icon in a rounded tile, a
 *   heading, supporting copy and an optional call to action. Use it for
 *   first-run screens where there is genuinely nothing yet and the next step
 *   matters (a whole page, or a sub-tab with `size="sm"`).
 * - `subtle` — the quiet, muted line used when a list simply filtered down to
 *   nothing ("No invoices in this filter."). No heading weight, no icon tile.
 *
 * `bordered` draws the dashed frame for a state that stands on its own in the
 * flow; omit it inside a `PanelCard` or other container that already frames the
 * region. `size="sm"` scales the `default` variant down for tabs and panels.
 */
type EmptyStateProps = {
  variant?: "default" | "subtle"
  size?: "default" | "sm"
  bordered?: boolean
  icon?: IconSvgElement
  title: React.ReactNode
  description?: React.ReactNode
  /** Primary call to action — typically a <Button>. */
  action?: React.ReactNode
  /** Extra content below the action, e.g. a preview of what will appear here. */
  children?: React.ReactNode
  className?: string
}

export function EmptyState({
  variant = "default",
  size = "default",
  bordered = false,
  icon,
  title,
  description,
  action,
  children,
  className,
}: EmptyStateProps) {
  const frame = bordered && "rounded-2xl border border-dashed border-border"

  if (variant === "subtle") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 px-6 py-16 text-center",
          frame,
          className
        )}
      >
        {icon && (
          <HugeiconsIcon icon={icon} className="size-6 text-muted-foreground/60" />
        )}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground/70">{description}</p>
          )}
        </div>
        {action}
      </div>
    )
  }

  const sm = size === "sm"

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        sm
          ? "gap-4 px-6 py-16"
          : "mx-auto max-w-md gap-6 py-16 sm:py-24",
        frame,
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex items-center justify-center bg-muted text-muted-foreground",
            sm ? "size-11 rounded-xl" : "size-14 rounded-2xl"
          )}
        >
          <HugeiconsIcon icon={icon} className={sm ? "size-5" : "size-7"} />
        </div>
      )}
      <div className={cn(sm ? "max-w-sm space-y-1" : "space-y-2")}>
        <h2
          className={cn(
            sm
              ? "text-sm font-medium"
              : "text-xl font-semibold tracking-tight"
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
      {children}
    </div>
  )
}
