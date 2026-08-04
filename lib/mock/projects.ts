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

/** Milestone status (Clover CMS API `Milestone.status`). */
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED"

/** A milestone on a project (§1.2.2). Ordered by `order`. */
export type Milestone = {
  id: string
  title: string
  description?: string
  /** Display date, e.g. "Aug 14". */
  due: string
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
  brief: string
  phase: Phase
  status: ProjectStatus
  /** 0–100, derived from completed milestones in real life. */
  progress: number
  /** Total value in `currency`. */
  value: number
  currency: string
  /** Display dates, e.g. "Mar 2024". */
  start: string
  target: string
  /** Revision linkage (§1.2.5) — null for original projects. */
  parentProjectId: string | null
  archived: boolean
  milestones: Milestone[]
  /** Relative last-touch, e.g. "2h ago". */
  lastActivity: string
  lastActivityHours: number
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
    due: m.due,
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
    brief:
      "Rebuild the Atlas Foods marketing site on the new design system, with a headless CMS for the editorial team.",
    phase: "Development",
    status: "IN_PROGRESS",
    progress: 62,
    value: 52000,
    currency: "USD",
    start: "Mar 2024",
    target: "Sep 2024",
    parentProjectId: null,
    archived: false,
    lastActivity: "2h ago",
    lastActivityHours: 2,
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
    brief: "Visual identity refresh — logo, palette, typography and guidelines.",
    phase: "Launch",
    status: "COMPLETED",
    progress: 100,
    value: 28000,
    currency: "USD",
    start: "Jan 2024",
    target: "Apr 2024",
    parentProjectId: null,
    archived: false,
    lastActivity: "3mo ago",
    lastActivityHours: 2200,
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
    brief: "Refresh the Northwind brand ahead of their Series B raise.",
    phase: "Design",
    status: "IN_PROGRESS",
    progress: 45,
    value: 24000,
    currency: "USD",
    start: "Jan 2024",
    target: "Aug 2024",
    parentProjectId: null,
    archived: false,
    lastActivity: "3d ago",
    lastActivityHours: 72,
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
    brief: "Full identity for a new travel-tech startup.",
    phase: "Discovery",
    status: "IN_PROGRESS",
    progress: 20,
    value: 12000,
    currency: "GBP",
    start: "Feb 2024",
    target: "Jun 2024",
    parentProjectId: null,
    archived: false,
    lastActivity: "5h ago",
    lastActivityHours: 5,
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
    brief: "Launch campaign for the Muse spring collection.",
    phase: "Launch",
    status: "REVIEW",
    progress: 88,
    value: 18000,
    currency: "USD",
    start: "Apr 2024",
    target: "Aug 2024",
    parentProjectId: null,
    archived: false,
    lastActivity: "1d ago",
    lastActivityHours: 24,
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
    brief: "Rebrand a sustainability-focused architecture studio.",
    phase: "Kickoff",
    status: "PLANNING",
    progress: 5,
    value: 30000,
    currency: "EUR",
    start: "Jun 2025",
    target: "Dec 2025",
    parentProjectId: null,
    archived: false,
    lastActivity: "6h ago",
    lastActivityHours: 6,
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
    brief: "Packaging system for a new line of cold-pressed juices.",
    phase: "Design",
    status: "IN_PROGRESS",
    progress: 52,
    value: 16000,
    currency: "USD",
    start: "May 2024",
    target: "Sep 2024",
    parentProjectId: null,
    archived: false,
    lastActivity: "2d ago",
    lastActivityHours: 48,
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
    brief: "Customer dashboard for Lumen's energy-monitoring hardware.",
    phase: "Development",
    status: "ON_HOLD",
    progress: 40,
    value: 64000,
    currency: "EUR",
    start: "Nov 2023",
    target: "Oct 2024",
    parentProjectId: null,
    archived: false,
    lastActivity: "4h ago",
    lastActivityHours: 4,
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
    brief: "Sizzle reel and motion system for Fable's streaming launch.",
    phase: "Design",
    status: "IN_PROGRESS",
    progress: 55,
    value: 9000,
    currency: "USD",
    start: "Jul 2024",
    target: "Oct 2024",
    parentProjectId: null,
    archived: false,
    lastActivity: "1d ago",
    lastActivityHours: 26,
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
    brief:
      "Revision: extend the Lumen dashboard to native mobile after the web beta.",
    phase: "Kickoff",
    status: "PLANNING",
    progress: 8,
    value: 22000,
    currency: "EUR",
    start: "Aug 2024",
    target: "Jan 2025",
    parentProjectId: "p-lumen-1",
    archived: false,
    lastActivity: "5d ago",
    lastActivityHours: 120,
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
    brief: "Marketing site for a boutique maritime law firm.",
    phase: "Launch",
    status: "COMPLETED",
    progress: 100,
    value: 34000,
    currency: "USD",
    start: "Aug 2023",
    target: "Dec 2023",
    parentProjectId: null,
    archived: false,
    lastActivity: "2mo ago",
    lastActivityHours: 1460,
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
    brief: "Single landing page for a product that has since sunset.",
    phase: "Launch",
    status: "CANCELLED",
    progress: 100,
    value: 8000,
    currency: "USD",
    start: "Feb 2023",
    target: "Mar 2023",
    parentProjectId: null,
    archived: true,
    lastActivity: "6mo ago",
    lastActivityHours: 4380,
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
