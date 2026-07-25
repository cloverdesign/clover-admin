"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, Menu01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { NAV_SECTIONS, ALL_ITEMS } from "@/components/admin/shell/nav-data"
import {
  Brand,
  SearchField,
  IconButton,
  NotificationButton,
  ThemeToggle,
  NewButton,
  UserChip,
} from "@/components/admin/shell/parts"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { CurrencyControls } from "@/components/admin/shell/currency-controls"

/** Is this nav item the current page? `/admin` matches exactly (so it isn't lit
 * for every sub-route); everything else matches on prefix. */
function isActive(href: string, pathname: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
}

/** Brand + grouped nav + user footer. Shared by the desktop rail and the mobile
 * drawer; `onNavigate` lets the drawer close itself when a link is tapped. */
function SidebarBody({
  onNavigate,
  showCurrency,
}: {
  onNavigate?: () => void
  showCurrency?: boolean
}) {
  const pathname = usePathname()

  return (
    <>
      <div className="flex h-12 items-center px-2">
        <Brand />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="space-y-1">
            <div className="px-2 pb-1 font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
              {section.label}
            </div>
            {section.items.map((item) => {
              const current = isActive(item.href, pathname)
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors",
                    current
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <HugeiconsIcon icon={item.icon} className="size-4.5 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium",
                        current
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {showCurrency && (
        <div className="mb-3 space-y-2 border-t border-border pt-3">
          <div className="px-2 font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
            Currency
          </div>
          <CurrencyControls />
        </div>
      )}

      <div className="flex items-center gap-2 rounded-full bg-muted/50 p-1.5 pl-2">
        <UserChip className="flex-1" />
        <button
          type="button"
          aria-label="Sign out"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <HugeiconsIcon icon={Logout01Icon} className="size-5" />
        </button>
      </div>
    </>
  )
}

/**
 * Admin panel shell — floating sidebar + content canvas on a tinted frame.
 * Responsive: the rail collapses into a slide-in drawer below `md`, and the
 * header condenses its search/actions. The header title is derived from the
 * active nav item. Route protection lives elsewhere.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = React.useState(false)
  const active = ALL_ITEMS.find((item) => isActive(item.href, pathname))
  const title = active?.label ?? "Dashboard"

  return (
    <div className="flex h-dvh gap-3 overflow-hidden bg-sidebar p-2 sm:p-3">
      {/* Desktop rail */}
      <aside className="hidden w-64 shrink-0 flex-col rounded-2xl bg-card p-3 ring-1 ring-foreground/10 md:flex">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side="left"
          className="flex w-72 max-w-[85vw] flex-col bg-card p-3"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Admin panel navigation
          </SheetDescription>
          <SidebarBody onNavigate={() => setNavOpen(false)} showCurrency />
        </SheetContent>
      </Sheet>

      {/* Floating canvas */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <header className="flex h-16 items-center gap-2 border-b border-border px-4 sm:gap-4 sm:px-6">
          <IconButton
            label="Open navigation"
            className="md:hidden"
            onClick={() => setNavOpen(true)}
          >
            <HugeiconsIcon icon={Menu01Icon} className="size-5" />
          </IconButton>

          <h1 className="truncate text-base font-semibold tracking-tight">
            {title}
          </h1>

          <SearchField className="ml-auto hidden w-full max-w-xs md:block" />

          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
            <IconButton label="Search" className="md:hidden">
              <HugeiconsIcon icon={Search01Icon} className="size-5" />
            </IconButton>
            <CurrencyControls className="hidden sm:flex" />
            <NotificationButton />
            <ThemeToggle />
            <NewButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
