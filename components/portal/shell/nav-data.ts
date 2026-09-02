import {
  DashboardSquare01Icon,
  Folder01Icon,
  DeliveryBox01Icon,
  GitBranchIcon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons"

/** All icons share the same shape; borrow one for the type. */
type IconGlyph = typeof Folder01Icon

export type PortalNavItem = {
  key: string
  label: string
  icon: IconGlyph
  href: string
}

export type PortalNavSection = {
  /** Rendered as an uppercase divider label; the lead section has none. */
  label?: string
  items: PortalNavItem[]
}

/**
 * Client-portal IA. Two of these — Files and Invoices — exist because the API
 * gained client-wide `GET /api/portal/deliverables` and `/api/portal/invoices`.
 * Before those, the only way to see a client's whole set was to fan out over
 * their projects, so both lived as summary cards on the dashboard with no page
 * of their own.
 */
export const PORTAL_NAV: PortalNavSection[] = [
  {
    items: [
      {
        key: "home",
        label: "Home",
        icon: DashboardSquare01Icon,
        href: "/",
      },
    ],
  },
  {
    label: "Work",
    items: [
      {
        key: "projects",
        label: "Projects",
        icon: Folder01Icon,
        href: "/projects",
      },
      {
        key: "files",
        label: "Files",
        icon: DeliveryBox01Icon,
        href: "/files",
      },
      {
        key: "requests",
        label: "Requests",
        icon: GitBranchIcon,
        href: "/requests",
      },
    ],
  },
  {
    label: "Billing",
    items: [
      {
        key: "invoices",
        label: "Invoices",
        icon: Invoice01Icon,
        href: "/invoices",
      },
    ],
  },
]

export const PORTAL_NAV_ITEMS: PortalNavItem[] = PORTAL_NAV.flatMap((s) => s.items)

/** Is this nav item the current page? `/` matches exactly so Home isn't lit for
 * every route; everything else matches on prefix. */
export function isPortalNavActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
