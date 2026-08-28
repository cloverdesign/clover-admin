"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Logout01Icon,
  Menu01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { CloverMark } from "@/components/admin/auth/clover-mark"
import { usePortalMe, usePortalLogout, usePortalProject } from "@/lib/queries/portal-queries"
import {
  PORTAL_NAV,
  PORTAL_NAV_ITEMS,
  isPortalNavActive,
} from "@/components/portal/shell/nav-data"
import { ClientChip, ThemeSwitcher } from "@/components/portal/shell/parts"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

/**
 * Client-facing chrome: a grouped navigation sidebar and a content canvas — the
 * same floating-panel frame the admin shell uses, at the portal's smaller scale.
 * Below `md` the sidebar folds into a drawer.
 *
 * This replaced a top bar with three links: client-wide deliverable and invoice
 * reads gave Files and Invoices pages of their own, and five destinations in two
 * groups no longer fit a header.
 */
export function PortalShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = React.useState(false)

  return (
    <div className="flex h-dvh gap-2 overflow-hidden bg-sidebar p-2 sm:gap-3 sm:p-3">
      <aside className="hidden w-60 shrink-0 flex-col rounded-2xl bg-card p-3 ring-1 ring-foreground/10 md:flex">
        <SidebarBody />
      </aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side="left"
          className="flex w-72 max-w-[85vw] flex-col bg-card p-3"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Client portal navigation</SheetDescription>
          <SidebarBody onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background ring-1 ring-foreground/10">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 sm:gap-4 sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setNavOpen(true)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            <HugeiconsIcon icon={Menu01Icon} className="size-5" />
          </button>

          <HeaderNav />
        </header>

        {/* Vertical padding lives on the inner column, not here: a sticky
            toolbar pins to the scroll port's padding box, so top padding on
            `main` would leave a band above it where content scrolls in view. */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="mx-auto w-full max-w-5xl py-4 sm:py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

function SignOutButton({ onSignOut }: { onSignOut?: () => void }) {
  const router = useRouter()
  const logout = usePortalLogout()

  const signOut = () => {
    onSignOut?.()
    logout.mutate(undefined, { onSettled: () => router.replace("/login") })
  }

  return (
    <button
      type="button"
      aria-label="Sign out"
      onClick={signOut}
      className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <HugeiconsIcon icon={Logout01Icon} className="size-5" />
    </button>
  )
}

/* ---------------------------------------------------------------- sidebar */

/**
 * Mark, identity, grouped nav, then theme and sign out. Shared by the desktop
 * sidebar and the mobile drawer; `onNavigate` lets the drawer close itself when
 * a link is tapped.
 */
function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data: client } = usePortalMe()

  return (
    <>
      <Link
        href="/"
        onClick={onNavigate}
        aria-label="Home"
        className="flex items-center gap-2.5 rounded-xl px-1 py-1.5 transition-colors hover:bg-muted/60"
      >
        <CloverMark className="size-6 shrink-0" />
        {client ? (
          <ClientChip company={client.company} name={client.name} className="min-w-0 flex-1" />
        ) : (
          <span className="text-sm font-semibold tracking-tight">Clover</span>
        )}
      </Link>

      <nav className="mt-3 flex-1 space-y-5 overflow-y-auto">
        {PORTAL_NAV.map((section, i) => (
          <div key={section.label ?? `lead-${i}`} className="space-y-1">
            {section.label && (
              <div className="px-2 pb-1 font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const current = isPortalNavActive(item.href, pathname)
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors",
                    current
                      ? "bg-secondary font-medium text-secondary-foreground"
                      : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <HugeiconsIcon icon={item.icon} className="size-4.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <ThemeSwitcher className="min-w-0 flex-1" />
        <SignOutButton onSignOut={onNavigate} />
      </div>
    </>
  )
}

/* ----------------------------------------------------------------- header */

/** The project name, once it loads; the id is the placeholder until then. */
function ProjectCrumb({ id, fallback }: { id: string; fallback: string }) {
  return <>{usePortalProject(id).data?.name ?? fallback}</>
}

/** Title-cased last path segment — the crumb for a deep route with no better
 * label, and the placeholder while an entity name loads. */
function segmentLabel(pathname: string): string {
  const last = pathname.split("/").filter(Boolean).pop() ?? ""
  return last.charAt(0).toUpperCase() + last.slice(1)
}

/** Breadcrumb trail derived from the pathname: the active nav item, plus a
 * second crumb and a back button on any route below it. */
function HeaderNav() {
  const pathname = usePathname()
  const active = PORTAL_NAV_ITEMS.find((item) => isPortalNavActive(item.href, pathname))
  const base = active ?? PORTAL_NAV_ITEMS[0]
  // Home's href is "/", which prefixes everything — only a matched nav item can
  // have something below it, or every unknown route reads as "Home › Home".
  const deeper = Boolean(active) && pathname !== base.href && pathname.startsWith(base.href)

  const projectId = pathname.match(/^\/projects\/([^/]+)$/)?.[1]

  return (
    <div className="flex min-w-0 items-center gap-2">
      {deeper && (
        <Link
          href={base.href}
          aria-label="Back"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
        </Link>
      )}
      {/* Small and grey on purpose: the page's own hero carries the title, and
          two prominent copies of it read as a mistake. */}
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"
      >
        {deeper ? (
          <>
            <Link
              href={base.href}
              className="hidden truncate transition-colors hover:text-foreground sm:block"
            >
              {base.label}
            </Link>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="hidden size-3.5 shrink-0 text-muted-foreground/50 sm:block"
            />
            <span className="truncate text-foreground">
              {projectId ? (
                <ProjectCrumb id={projectId} fallback={segmentLabel(pathname)} />
              ) : (
                segmentLabel(pathname)
              )}
            </span>
          </>
        ) : (
          <span className="truncate">{base.label}</span>
        )}
      </nav>
    </div>
  )
}
