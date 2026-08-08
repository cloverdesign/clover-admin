"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Logout01Icon,
  Menu01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { NAV_SECTIONS, ALL_ITEMS } from "@/components/admin/shell/nav-data"
import {
  Brand,
  SearchField,
  SearchIconButton,
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
import { CommandPaletteProvider } from "@/components/admin/shell/command-palette"
import { getProject } from "@/lib/mock/projects"
import { getInvoice } from "@/lib/mock/invoices"
import { getRevision, revisionTitle } from "@/lib/mock/revisions"
import { getDeliverable } from "@/lib/mock/deliverables"
import { getPage, getCaseStudy, getTestimonial } from "@/lib/mock/cms"
import { clearToken } from "@/lib/api/auth-storage"
import { Toaster } from "@/components/ui/sonner"

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
  const router = useRouter()

  const signOut = () => {
    clearToken()
    onNavigate?.()
    router.push("/admin/login")
  }

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
                      ? "bg-secondary font-medium text-secondary-foreground"
                      : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <HugeiconsIcon icon={item.icon} className="size-4.5 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium",
                        current
                          ? "bg-background text-foreground"
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
          onClick={signOut}
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
/** Labels for deep routes that aren't nav items, keyed by exact pathname. */
const DEEP_CRUMBS: Record<string, string> = {
  "/admin/clients/new": "New client",
  "/admin/clients/new-project": "New project",
  "/admin/invoices/new": "New invoice",
  "/admin/deliverables/new": "New deliverable",
  "/admin/cms/pages": "Pages",
  "/admin/cms/case-studies": "Case studies",
  "/admin/cms/case-studies/new": "New case study",
  "/admin/cms/testimonials": "Testimonials",
  "/admin/cms/testimonials/new": "New testimonial",
  "/admin/cms/media": "Media",
  "/admin/cms/settings": "Site settings",
}

/** Label for the deepest crumb: an explicit map entry, else a resolved entity
 * name (project detail), else the title-cased last path segment. */
function deepLabel(pathname: string): string {
  if (DEEP_CRUMBS[pathname]) return DEEP_CRUMBS[pathname]

  if (/^\/admin\/clients\/[^/]+\/edit$/.test(pathname)) return "Edit client"
  if (/^\/admin\/projects\/[^/]+\/edit$/.test(pathname)) return "Edit project"
  if (/^\/admin\/invoices\/[^/]+\/edit$/.test(pathname)) return "Edit invoice"
  if (/^\/admin\/deliverables\/[^/]+\/edit$/.test(pathname)) return "Edit deliverable"

  const projectMatch = pathname.match(/^\/admin\/projects\/([^/]+)$/)
  if (projectMatch) {
    const project = getProject(projectMatch[1])
    if (project) return project.name
  }

  const invoiceMatch = pathname.match(/^\/admin\/invoices\/([^/]+)$/)
  if (invoiceMatch) {
    const invoice = getInvoice(invoiceMatch[1])
    if (invoice) return invoice.invoiceNumber
  }

  const revisionMatch = pathname.match(/^\/admin\/revisions\/([^/]+)$/)
  if (revisionMatch) {
    const revision = getRevision(revisionMatch[1])
    if (revision) return revisionTitle(revision)
  }

  const deliverableMatch = pathname.match(/^\/admin\/deliverables\/([^/]+)$/)
  if (deliverableMatch) {
    const deliverable = getDeliverable(deliverableMatch[1])
    if (deliverable) return deliverable.title
  }

  const cmsPageMatch = pathname.match(/^\/admin\/cms\/pages\/([^/]+)$/)
  if (cmsPageMatch) {
    const page = getPage(cmsPageMatch[1])
    if (page) return page.title
  }

  const caseStudyMatch = pathname.match(/^\/admin\/cms\/case-studies\/([^/]+)$/)
  if (caseStudyMatch) {
    const cs = getCaseStudy(caseStudyMatch[1])
    if (cs) return cs.title
  }

  const testimonialMatch = pathname.match(/^\/admin\/cms\/testimonials\/([^/]+)$/)
  if (testimonialMatch) {
    const t = getTestimonial(testimonialMatch[1])
    if (t) return t.author
  }

  const last = pathname.split("/").filter(Boolean).pop() ?? ""
  return last.charAt(0).toUpperCase() + last.slice(1)
}

/** Breadcrumb trail + a back button, derived from the pathname. The active nav
 * item is the first crumb; any deeper route adds a second (labelled crumb), and
 * a back button pointing at the parent appears. */
function HeaderNav() {
  const pathname = usePathname()
  const active = ALL_ITEMS.find((item) => isActive(item.href, pathname))
  const base = active ?? { label: "Dashboard", href: "/admin" }
  const deeper = pathname !== base.href && pathname.startsWith(base.href)

  const crumbs: { label: string; href?: string }[] = [
    { label: base.label, href: deeper ? base.href : undefined },
  ]
  if (deeper) {
    crumbs.push({ label: deepLabel(pathname) })
  }

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
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <React.Fragment key={c.label}>
              {i > 0 && (
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4 shrink-0 text-muted-foreground/50"
                />
              )}
              {isLast || !c.href ? (
                <span className="truncate text-base font-semibold tracking-tight">
                  {c.label}
                </span>
              ) : (
                <Link
                  href={c.href}
                  className="truncate text-base font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                >
                  {c.label}
                </Link>
              )}
            </React.Fragment>
          )
        })}
      </nav>
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = React.useState(false)

  return (
    <CommandPaletteProvider>
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
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background ring-1 ring-foreground/10">
        <header className="flex h-16 items-center gap-2 border-b border-border px-4 sm:gap-4 sm:px-6">
          <IconButton
            label="Open navigation"
            className="md:hidden"
            onClick={() => setNavOpen(true)}
          >
            <HugeiconsIcon icon={Menu01Icon} className="size-5" />
          </IconButton>

          <HeaderNav />

          <SearchField className="ml-auto hidden w-full max-w-xs md:block" />

          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
            <SearchIconButton className="md:hidden" />
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
    <Toaster />
    </CommandPaletteProvider>
  )
}
