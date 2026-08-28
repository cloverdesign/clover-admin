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
  description: string
  /** Requested target window, e.g. "Within 3 weeks". */
  targetTimeframe?: string
  attachments: Attachment[]
  status: RevisionStatus
  /** ISO date-time the request was submitted (API `RevisionRequest.createdAt`). */
  createdAt: string
  /** How an approved request was scaffolded (§1.2.5) — API fields. Set the
   * project id when actioned as a new linked project; the note when as a new
   * phase on the existing project. Null until approved. */
  resultingProjectId: string | null
  resultingPhaseNote: string | null
}

/** Short display label — the API has no title, so derive one from the first
 * sentence of the description. */
export function revisionTitle(r: RevisionRequest): string {
  const first = r.description.split(/(?<=[.!?])\s/)[0].trim()
  return first.length > 64 ? first.slice(0, 61).trimEnd() + "…" : first
}

export const REVISIONS: RevisionRequest[] = [
  {
    id: "rev-atlas-blog",
    clientId: "c-atlas", client: "Contoso Foods",
    projectId: "p-atlas-1", projectName: "Site build",
    description:
      "We'd like a blog area for recipes and press. Listing page, article template, and a way for our team to publish from the CMS. Reference layouts attached.",
    targetTimeframe: "Within 3 weeks",
    attachments: [
      { name: "blog-references.pdf", size: "2.4 MB" },
      { name: "article-wireframe.png", size: "840 KB" },
    ],
    status: "REQUESTED",
    createdAt: "2024-08-01",
    resultingProjectId: null,
    resultingPhaseNote: null,
  },
  {
    id: "rev-muse-tiktok",
    clientId: "c-muse", client: "Relecloud",
    projectId: "p-muse-1", projectName: "Campaign",
    description:
      "Loving the launch creative — can we adapt the hero set for 9:16 TikTok and add three short cutdowns?",
    targetTimeframe: "Before the spring push",
    attachments: [],
    status: "REQUESTED",
    createdAt: "2024-07-29",
    resultingProjectId: null,
    resultingPhaseNote: null,
  },
  {
    id: "rev-kite-logos",
    clientId: "c-kite", client: "Litware",
    projectId: "p-kite-1", projectName: "Identity",
    description:
      "Could we get a stacked lockup and a monochrome variant for stamps? Attaching where we'd use them.",
    targetTimeframe: undefined,
    attachments: [{ name: "usage-examples.pdf", size: "1.1 MB" }],
    status: "IN_REVIEW",
    createdAt: "2024-07-22",
    resultingProjectId: null,
    resultingPhaseNote: null,
  },
  {
    id: "rev-lumen-mobile",
    clientId: "c-lumen", client: "Proseware",
    projectId: "p-lumen-1", projectName: "Web app",
    description:
      "After the web beta we want a native mobile app for the dashboard. Same feature set, offline support.",
    targetTimeframe: "Q1 next year",
    attachments: [{ name: "mobile-brief.pdf", size: "3.2 MB" }],
    status: "APPROVED",
    createdAt: "2024-07-10",
    resultingProjectId: "p-lumen-2",
    resultingPhaseNote: null,
  },
  {
    id: "rev-north-motion",
    clientId: "c-northwind", client: "Northwind",
    projectId: "p-north-1", projectName: "Brand refresh",
    description:
      "Can the brand guidelines cover motion — logo animation, easing, and a couple of transitions?",
    targetTimeframe: "With the rollout",
    attachments: [],
    status: "APPROVED",
    createdAt: "2024-07-05",
    resultingProjectId: null,
    resultingPhaseNote: "Motion guidelines (phase)",
  },
  {
    id: "rev-harbor-seo",
    clientId: "c-harbor", client: "Woodgrove & Co",
    projectId: "p-harbor-1", projectName: "Website",
    description:
      "Would you take on a monthly SEO retainer now the site is live? Audits, content, reporting.",
    targetTimeframe: "Ongoing",
    attachments: [],
    status: "DECLINED",
    createdAt: "2024-06-20",
    resultingProjectId: null,
    resultingPhaseNote: null,
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
