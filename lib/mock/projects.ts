/**
 * Typed dummy data for the admin Projects area — the hub the invoices,
 * revisions and deliverables surfaces all hang off (PRD §1.3 "Project"). A
 * Project belongs to a client, carries the brief/dates/value/currency, a
 * current phase, an ordered milestone list, and a nullable `parentProjectId`
 * for revisions-as-linked-projects (§1.2.5).
 *
 * Client identity is referenced by id/name so the list can render without
 * joining against `clients.ts`. Swap this module for real API calls later.
 */

import type { Phase } from "@/lib/mock/dashboard"

/** Project lifecycle status (Clover CMS API `Project.status`). */
export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED"

/**
 * Suggested project types for the type dropdown. The API stores `type` as a
 * free-form nullable string (not an enum), so this is a convenience list for
 * consistent labelling — callers may still persist a value outside it.
 */
export const PROJECT_TYPES = [
  "Website",
  "Web App",
  "Mobile App",
  "Branding",
  "Brand Identity",
  "Design System",
  "Marketing Campaign",
  "E-commerce",
  "Packaging",
  "Motion / Video",
  "Retainer",
  "Other",
]

/** Milestone status (Clover CMS API `Milestone.status`). */
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED"

/** A milestone on a project (§1.2.2). Ordered by `order`. */
export type Milestone = {
  id: string
  title: string
  description?: string
  /** ISO date-time the milestone is due (API `Milestone.dueDate`). */
  dueDate: string
  status: MilestoneStatus
  order: number
}

export type Project = {
  id: string
  name: string
  clientId: string
  /** Denormalized client company name for list rendering. */
  client: string
  /** Short one-liner shown in cards/rows. */
  type: string
  description: string
  phase: Phase
  status: ProjectStatus
  /** 0–100, derived from completed milestones in real life. */
  progress: number
  /** Total value in `currency`. */
  totalValue: number
  currency: string
  /** ISO date-time (API `Project.startDate` / `endDate`). */
  startDate: string
  endDate: string
  /** Revision linkage (§1.2.5) — null for original projects. */
  parentProjectId: string | null
  archived: boolean
  milestones: Milestone[]
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** "Mar 20" → ISO date. Milestone dues are year-less in the seed; anchor to
 * 2024 (display is compact, so the year isn't shown). */
function toIso(monthDay: string): string {
  const [mon, day] = monthDay.split(" ")
  const m = MONTHS.indexOf(mon) + 1
  return `2024-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/** Build a small ordered milestone set from titles + a completed cutoff. */
function milestones(
  items: { title: string; due: string; description?: string }[],
  doneThrough: number
): Milestone[] {
  return items.map((m, i) => ({
    id: `m-${i}`,
    title: m.title,
    description: m.description,
    dueDate: toIso(m.due),
    order: i,
    status:
      i < doneThrough ? "COMPLETED" : i === doneThrough ? "IN_PROGRESS" : "PENDING",
  }))
}

export const PROJECTS: Project[] = [
  {
    id: "p-atlas-1",
    name: "Site build",
    clientId: "c-atlas",
    client: "Atlas Foods",
    type: "Website",
    description:
      "Rebuild the Atlas Foods marketing site on the new design system, with a headless CMS for the editorial team.",
    phase: "Development",
    status: "IN_PROGRESS",
    progress: 62,
    totalValue: 52000,
    currency: "USD",
    startDate: "2024-03-01",
    endDate: "2024-09-01",
    parentProjectId: null,
    archived: false,
    milestones: milestones(
      [
        { title: "Kickoff & discovery", due: "Mar 20" },
        { title: "Design system", due: "May 02" },
        { title: "Frontend build", due: "Jul 18" },
        { title: "CMS integration", due: "Aug 22" },
        { title: "Launch", due: "Sep 10" },
      ],
      3
    ),
  },
  {
    id: "p-atlas-2",
    name: "Brand system",
    clientId: "c-atlas",
    client: "Atlas Foods",
    type: "Branding",
    description: "Visual identity refresh — logo, palette, typography and guidelines.",
    phase: "Launch",
    status: "COMPLETED",
    progress: 100,
    totalValue: 28000,
    currency: "USD",
    startDate: "2024-01-01",
    endDate: "2024-04-01",
    parentProjectId: null,
    archived: false,
    milestones: milestones(
      [
        { title: "Research", due: "Jan 18" },
        { title: "Concepts", due: "Feb 20" },
        { title: "Guidelines", due: "Apr 05" },
      ],
      3
    ),
  },
  {
    id: "p-north-1",
    name: "Brand refresh",
    clientId: "c-northwind",
    client: "Northwind",
    type: "Branding",
    description: "Refresh the Northwind brand ahead of their Series B raise.",
    phase: "Design",
    status: "IN_PROGRESS",
    progress: 45,
    totalValue: 24000,
    currency: "USD",
    startDate: "2024-01-01",
    endDate: "2024-08-01",
    parentProjectId: null,
    archived: false,
    milestones: milestones(
      [
        { title: "Discovery", due: "Feb 02" },
        { title: "Moodboards", due: "Mar 15" },
        { title: "Direction", due: "May 30" },
        { title: "Rollout", due: "Aug 12" },
      ],
      2
    ),
  },
  {
    id: "p-kite-1",
    name: "Identity",
    clientId: "c-kite",
    client: "Kite",
    type: "Branding",
    description: "Full identity for a new travel-tech startup.",
    phase: "Discovery",
    status: "IN_PROGRESS",
    progress: 20,
    totalValue: 12000,
    currency: "GBP",
    startDate: "2024-02-01",
    endDate: "2024-06-01",
    parentProjectId: null,
    archived: false,
    milestones: milestones(
      [
        { title: "Brand strategy", due: "Feb 28" },
        { title: "Naming", due: "Mar 30" },
        { title: "Identity", due: "May 20" },
      ],
      1
    ),
  },
  {
    id: "p-muse-1",
    name: "Campaign",
    clientId: "c-muse",
    client: "Muse",
    type: "Campaign",
    description: "Launch campaign for the Muse spring collection.",
    phase: "Launch",
    status: "REVIEW",
    progress: 88,
    totalValue: 18000,
    currency: "USD",
    startDate: "2024-04-01",
    endDate: "2024-08-01",
    parentProjectId: null,
    archived: false,
    milestones: milestones(
      [
        { title: "Creative", due: "Apr 25" },
        { title: "Production", due: "Jun 10" },
        { title: "Media plan", due: "Jul 15" },
        { title: "Go live", due: "Aug 08" },
      ],
      3
    ),
  },
  {
    id: "p-verde-1",
    name: "Rebrand",
    clientId: "c-verde",
    client: "Verde Studio",
    type: "Branding",
    description: "Rebrand a sustainability-focused architecture studio.",
    phase: "Kickoff",
    status: "PLANNING",
    progress: 5,
    totalValue: 30000,
    currency: "EUR",
    startDate: "2025-06-01",
    endDate: "2025-12-01",
    parentProjectId: null,
    archived: false,
    milestones: milestones(
      [
        { title: "Kickoff", due: "Jun 24" },
        { title: "Discovery", due: "Aug 05" },
        { title: "Direction", due: "Oct 10" },
      ],
      0
    ),
  },
  {
    id: "p-orch-1",
    name: "Packaging",
    clientId: "c-orchard",
    client: "Orchard",
    type: "Packaging",
    description: "Packaging system for a new line of cold-pressed juices.",
    phase: "Design",
    status: "IN_PROGRESS",
    progress: 52,
    totalValue: 16000,
    currency: "USD",
    startDate: "2024-05-01",
    endDate: "2024-09-01",
    parentProjectId: null,
    archived: false,
    milestones: milestones(
      [
        { title: "Structural", due: "May 20" },
        { title: "Graphics", due: "Jul 08" },
        { title: "Dielines", due: "Aug 30" },
      ],
      1
    ),
  },
  {
    id: "p-lumen-1",
    name: "Web app",
    clientId: "c-lumen",
    client: "Lumen",
    type: "Product",
    description: "Customer dashboard for Lumen's energy-monitoring hardware.",
    phase: "Development",
    status: "ON_HOLD",
    progress: 40,
    totalValue: 64000,
    currency: "EUR",
    startDate: "2023-11-01",
    endDate: "2024-10-01",
    parentProjectId: null,
    archived: false,
    milestones: milestones(
      [
        { title: "Discovery", due: "Dec 05" },
        { title: "Design", due: "Mar 20" },
        { title: "MVP build", due: "Jul 30" },
        { title: "Beta", due: "Sep 15" },
        { title: "Launch", due: "Oct 20" },
      ],
      2
    ),
  },
  {
    id: "p-fable-1",
    name: "Motion reel",
    clientId: "c-fable",
    client: "Fable",
    type: "Motion",
    description: "Sizzle reel and motion system for Fable's streaming launch.",
    phase: "Design",
    status: "IN_PROGRESS",
    progress: 55,
    totalValue: 9000,
    currency: "USD",
    startDate: "2024-07-01",
    endDate: "2024-10-01",
    parentProjectId: null,
    archived: false,
    milestones: milestones(
      [
        { title: "Storyboard", due: "Jul 20" },
        { title: "Animatic", due: "Aug 25" },
        { title: "Final", due: "Oct 05" },
      ],
      1
    ),
  },
  {
    id: "p-lumen-2",
    name: "Web app — mobile",
    clientId: "c-lumen",
    client: "Lumen",
    type: "Product",
    description:
      "Revision: extend the Lumen dashboard to native mobile after the web beta.",
    phase: "Kickoff",
    status: "PLANNING",
    progress: 8,
    totalValue: 22000,
    currency: "EUR",
    startDate: "2024-08-01",
    endDate: "2025-01-01",
    parentProjectId: "p-lumen-1",
    archived: false,
    milestones: milestones(
      [
        { title: "Scope", due: "Aug 20" },
        { title: "Design", due: "Oct 15" },
        { title: "Build", due: "Dec 20" },
      ],
      0
    ),
  },
  {
    id: "p-harbor-1",
    name: "Website",
    clientId: "c-harbor",
    client: "Harbor & Co",
    type: "Website",
    description: "Marketing site for a boutique maritime law firm.",
    phase: "Launch",
    status: "COMPLETED",
    progress: 100,
    totalValue: 34000,
    currency: "USD",
    startDate: "2023-08-01",
    endDate: "2023-12-01",
    parentProjectId: null,
    archived: false,
    milestones: milestones(
      [
        { title: "Discovery", due: "Aug 20" },
        { title: "Design", due: "Oct 05" },
        { title: "Build", due: "Nov 20" },
        { title: "Launch", due: "Dec 12" },
      ],
      4
    ),
  },
  {
    id: "p-tide-1",
    name: "Landing page",
    clientId: "c-tidewater",
    client: "Tidewater",
    type: "Website",
    description: "Single landing page for a product that has since sunset.",
    phase: "Launch",
    status: "CANCELLED",
    progress: 100,
    totalValue: 8000,
    currency: "USD",
    startDate: "2023-02-01",
    endDate: "2023-03-01",
    parentProjectId: null,
    archived: true,
    milestones: milestones(
      [
        { title: "Design", due: "Feb 20" },
        { title: "Build & launch", due: "Mar 15" },
      ],
      2
    ),
  },
]

/** Empty studio — no projects yet. Drives the empty state. */
export const EMPTY_PROJECTS: Project[] = []

/** Look up one project by id. */
export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id)
}

/** Projects that are revisions of `parentId` (§1.2.5). */
export function childProjects(parentId: string): Project[] {
  return PROJECTS.filter((p) => p.parentProjectId === parentId)
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In progress",
  REVIEW: "Review",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
  CANCELLED: "Cancelled",
}

/** A live project is anything not finished or cancelled — the default filter. */
export function isLive(p: Project): boolean {
  return !p.archived && p.status !== "COMPLETED" && p.status !== "CANCELLED"
}

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
}
