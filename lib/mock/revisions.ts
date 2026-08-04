/**
 * Typed dummy data for the admin Revision Requests queue (PRD §1.2.5, §1.3
 * "RevisionRequest"). A request belongs to a project (and, through it, a
 * client); it carries a description, optional target timeframe, attachments and
 * a status. Once approved it records how it was scaffolded — a new phase on the
 * existing project, or a new linked project.
 *
 * Swap this module for real API calls later.
 */

export type RevisionStatus = "REQUESTED" | "IN_REVIEW" | "APPROVED" | "DECLINED"

/** How an approved request was actioned (§1.2.5 step 4). */
export type Resolution = {
  type: "phase" | "project"
  /** Id of the created phase/project. */
  ref: string
  refName: string
}

export type Attachment = {
  name: string
  /** Display size, e.g. "2.4 MB". */
  size: string
}

export type RevisionRequest = {
  id: string
  clientId: string
  client: string
  projectId: string
  projectName: string
  title: string
  description: string
  /** Requested target window, e.g. "Within 3 weeks". */
  timeframe?: string
  attachments: Attachment[]
  status: RevisionStatus
  /** ISO date-time the request was submitted (API `RevisionRequest.createdAt`). */
  createdAt: string
  resolution?: Resolution
}

export const REVISIONS: RevisionRequest[] = [
  {
    id: "rev-atlas-blog",
    clientId: "c-atlas", client: "Atlas Foods",
    projectId: "p-atlas-1", projectName: "Site build",
    title: "Add an editorial / blog section",
    description:
      "We'd like a blog area for recipes and press. Listing page, article template, and a way for our team to publish from the CMS. Reference layouts attached.",
    timeframe: "Within 3 weeks",
    attachments: [
      { name: "blog-references.pdf", size: "2.4 MB" },
      { name: "article-wireframe.png", size: "840 KB" },
    ],
    status: "REQUESTED",
    createdAt: "2024-08-01",
  },
  {
    id: "rev-muse-tiktok",
    clientId: "c-muse", client: "Muse",
    projectId: "p-muse-1", projectName: "Campaign",
    title: "Extend the campaign to TikTok",
    description:
      "Loving the launch creative — can we adapt the hero set for 9:16 TikTok and add three short cutdowns?",
    timeframe: "Before the spring push",
    attachments: [],
    status: "REQUESTED",
    createdAt: "2024-07-29",
  },
  {
    id: "rev-kite-logos",
    clientId: "c-kite", client: "Kite",
    projectId: "p-kite-1", projectName: "Identity",
    title: "Additional logo lockups",
    description:
      "Could we get a stacked lockup and a monochrome variant for stamps? Attaching where we'd use them.",
    timeframe: undefined,
    attachments: [{ name: "usage-examples.pdf", size: "1.1 MB" }],
    status: "IN_REVIEW",
    createdAt: "2024-07-22",
  },
  {
    id: "rev-lumen-mobile",
    clientId: "c-lumen", client: "Lumen",
    projectId: "p-lumen-1", projectName: "Web app",
    title: "Native mobile companion app",
    description:
      "After the web beta we want a native mobile app for the dashboard. Same feature set, offline support.",
    timeframe: "Q1 next year",
    attachments: [{ name: "mobile-brief.pdf", size: "3.2 MB" }],
    status: "APPROVED",
    createdAt: "2024-07-10",
    resolution: { type: "project", ref: "p-lumen-2", refName: "Web app — mobile" },
  },
  {
    id: "rev-north-motion",
    clientId: "c-northwind", client: "Northwind",
    projectId: "p-north-1", projectName: "Brand refresh",
    title: "Add motion guidelines",
    description:
      "Can the brand guidelines cover motion — logo animation, easing, and a couple of transitions?",
    timeframe: "With the rollout",
    attachments: [],
    status: "APPROVED",
    createdAt: "2024-07-05",
    resolution: { type: "phase", ref: "p-north-1", refName: "Motion guidelines (phase)" },
  },
  {
    id: "rev-harbor-seo",
    clientId: "c-harbor", client: "Harbor & Co",
    projectId: "p-harbor-1", projectName: "Website",
    title: "Ongoing SEO retainer",
    description:
      "Would you take on a monthly SEO retainer now the site is live? Audits, content, reporting.",
    timeframe: "Ongoing",
    attachments: [],
    status: "DECLINED",
    createdAt: "2024-06-20",
  },
]

/** Empty studio — no revision requests yet. Drives the empty state. */
export const EMPTY_REVISIONS: RevisionRequest[] = []

/** A request is "pending" until it's approved or declined (§1.4 queue). */
export function isPending(r: RevisionRequest): boolean {
  return r.status === "REQUESTED" || r.status === "IN_REVIEW"
}

export function getRevision(id: string): RevisionRequest | undefined {
  return REVISIONS.find((r) => r.id === id)
}

export function revisionsForProject(projectId: string): RevisionRequest[] {
  return REVISIONS.filter((r) => r.projectId === projectId)
}

export function revisionsForClient(clientId: string): RevisionRequest[] {
  return REVISIONS.filter((r) => r.clientId === clientId)
}

/** Count of requests still needing a decision. */
export function pendingCount(): number {
  return REVISIONS.filter(isPending).length
}

export const REVISION_STATUS_LABEL: Record<RevisionStatus, string> = {
  REQUESTED: "Requested",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  DECLINED: "Declined",
}

export const REVISION_STATUS_VARIANT: Record<
  RevisionStatus,
  "info" | "warning" | "success" | "secondary"
> = {
  REQUESTED: "info",
  IN_REVIEW: "warning",
  APPROVED: "success",
  DECLINED: "secondary",
}
