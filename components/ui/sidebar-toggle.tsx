"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { SidebarLeft01Icon, SidebarRight01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

/** Collapse / expand a shell's navigation rail. Shared by the admin and client
 * shells, so it lives here rather than inside either one. */
export function SidebarToggle({
  collapsed,
  onToggle,
  className,
}: {
  collapsed: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-pressed={collapsed}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={onToggle}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
    >
      <HugeiconsIcon
        icon={collapsed ? SidebarRight01Icon : SidebarLeft01Icon}
        className="size-4.5"
      />
    </button>
  )
}
