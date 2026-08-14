"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  Notification01Icon,
  Add01Icon,
  Sun03Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCommandPalette } from "@/components/admin/shell/command-palette"
import { Kbd } from "@/components/ui/kbd"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CloverMark } from "@/components/admin/auth/clover-mark"
import { CURRENT_USER } from "@/components/admin/shell/nav-data"

/** Small shared atoms every shell variant composes — deliberately NOT a shared
 * layout. Each variant is free to arrange these however it likes. */

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <CloverMark className="size-7" />
      <span className="text-sm font-semibold tracking-tight">Clover</span>
      <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        Admin
      </span>
    </div>
  )
}

/** Looks like a search input, acts as a button — opens the global command
 * palette (also ⌘K). The palette owns the actual searching. */
export function SearchField({ className }: { className?: string }) {
  const { setOpen } = useCommandPalette()
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "relative flex h-9 w-full items-center rounded-(--input-radius) border border-input bg-background pr-14 pl-9 text-left text-sm text-muted-foreground transition-colors hover:border-ring/60",
        className
      )}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <span className="truncate">Search clients, projects…</span>
      <Kbd className="absolute top-1/2 right-2.5 hidden -translate-y-1/2 sm:inline-flex">
        ⌘K
      </Kbd>
    </button>
  )
}

export function IconButton({
  label,
  children,
  className,
  dot,
  onClick,
}: {
  label: string
  children: React.ReactNode
  className?: string
  dot?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative flex size-9 items-center justify-center rounded-(--button-radius) text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {children}
      {dot && (
        <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary ring-2 ring-background" />
      )}
    </button>
  )
}

/** Icon-only search trigger for the condensed (mobile) header. */
export function SearchIconButton({ className }: { className?: string }) {
  const { setOpen } = useCommandPalette()
  return (
    <IconButton label="Search" className={className} onClick={() => setOpen(true)}>
      <HugeiconsIcon icon={Search01Icon} className="size-5" />
    </IconButton>
  )
}

export function NotificationButton() {
  return (
    <IconButton label="Notifications" dot>
      <HugeiconsIcon icon={Notification01Icon} className="size-5" />
    </IconButton>
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  return (
    <IconButton
      label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} className="size-5" />
    </IconButton>
  )
}

/** The primary create action, scoped to the current section. */
function newAction(pathname: string): { label: string; href: string } {
  if (pathname.startsWith("/admin/invoices"))
    return { label: "New invoice", href: "/admin/invoices/new" }
  if (pathname.startsWith("/admin/deliverables"))
    return { label: "New deliverable", href: "/admin/deliverables/new" }
  if (pathname.startsWith("/admin/cms"))
    return { label: "New page", href: "/admin/cms/pages/new" }
  if (pathname.startsWith("/admin/projects"))
    return { label: "New project", href: "/admin/clients/new-project" }
  return { label: "New client", href: "/admin/clients/new" }
}

export function NewButton({ className }: { className?: string }) {
  const pathname = usePathname()
  const { label, href } = newAction(pathname)
  return (
    <>
      {/* Mobile: icon-only, perfectly centered (no inline-start padding). */}
      <Button
        aria-label={label}
        size="icon"
        render={<Link href={href} />}
        className={cn("sm:hidden", className)}
      >
        <HugeiconsIcon icon={Add01Icon} className="size-4" />
      </Button>
      {/* sm+: labelled. */}
      <Button render={<Link href={href} />} className={cn("hidden gap-1.5 sm:inline-flex", className)}>
        <HugeiconsIcon
          icon={Add01Icon}
          data-icon="inline-start"
          className="size-4"
        />
        {label}
      </Button>
    </>
  )
}

export function UserChip({
  compact,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar className="size-9 rounded-full">
        <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
          {CURRENT_USER.initials}
        </AvatarFallback>
      </Avatar>
      {!compact && (
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-sm font-medium">{CURRENT_USER.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {CURRENT_USER.role}
          </div>
        </div>
      )}
    </div>
  )
}
