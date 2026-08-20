import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Folder01Icon,
  Invoice01Icon,
  Task01Icon,
  DeliveryBox01Icon,
  Calendar03Icon,
  BrowserIcon,
  Settings01Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"

/** All icons share the same shape; borrow one for the type. */
type IconGlyph = typeof DashboardSquare01Icon

export type NavItem = {
  key: string
  label: string
  icon: IconGlyph
  href: string
  /** One-liner used by the icon-rail variant's contextual panel. */
  hint?: string
  /** Only render for SUPER_ADMIN accounts (the shell filters on the role). */
  superAdminOnly?: boolean
}

/**
 * Live count pills are keyed by NavItem `key` and computed at render time from
 * query data — see use-nav-badges. Counts are intentionally NOT stored on the
 * static nav items (that was the bug: the old hardcoded strings never updated).
 */

export type NavSection = {
  label: string
  items: NavItem[]
}

/** Shared IA across every shell variant — mirrors the PRD's admin panel
 * structure (§1.4 + Site CMS). Dummy hrefs; no route protection yet. */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Workspace",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: DashboardSquare01Icon,
        href: "/admin",
        hint: "Everything that needs you today",
      },
      {
        key: "clients",
        label: "Clients",
        icon: UserGroupIcon,
        href: "/admin/clients",
        hint: "Companies and contacts",
      },
      {
        key: "projects",
        label: "Projects",
        icon: Folder01Icon,
        href: "/admin/projects",
        hint: "Briefs, timelines, phases",
      },
      {
        key: "calendar",
        label: "Calendar",
        icon: Calendar03Icon,
        href: "/admin/calendar",
        hint: "Projects and milestones across time",
      },
      {
        key: "invoices",
        label: "Invoices",
        icon: Invoice01Icon,
        href: "/admin/invoices",
        hint: "Drafts and awaiting payment",
      },
      {
        key: "revisions",
        label: "Revision requests",
        icon: Task01Icon,
        href: "/admin/revisions",
        hint: "Incoming change requests",
      },
      {
        key: "deliverables",
        label: "Deliverables",
        icon: DeliveryBox01Icon,
        href: "/admin/deliverables",
        hint: "Uploads awaiting review",
      },
    ],
  },
  {
    label: "Site",
    items: [
      {
        key: "cms",
        label: "Site CMS",
        icon: BrowserIcon,
        href: "/admin/cms",
        hint: "Marketing site content",
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        key: "team",
        label: "Team",
        icon: ShieldKeyIcon,
        href: "/admin/team",
        hint: "Admin accounts & access",
        superAdminOnly: true,
      },
      {
        key: "settings",
        label: "Settings",
        icon: Settings01Icon,
        href: "/admin/settings",
        hint: "Workspace preferences",
      },
    ],
  },
]

export const ALL_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items)
