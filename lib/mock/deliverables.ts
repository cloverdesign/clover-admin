/**
 * Typed dummy data for the admin Deliverables area (PRD §1.2.6, §1.3
 * "Deliverable" / "DeliverableReview"). A deliverable is a piece of finished
 * work uploaded (file) or linked (Figma / hosted build) against a project, and
 * optionally a milestone. It's versioned — a new upload supersedes the old one
 * (v1 → SUPERSEDED, v2 → READY). The client reviews the latest version:
 * approve, or request changes with a comment (which is the entry point into a
 * formal revision request, §1.2.5).
 *
 * Client/project identity is denormalized so the list renders without joining.
 * Swap this module for real API calls later.
 */

import { getProject } from "@/lib/mock/projects"

export type DeliverableStatus = "READY" | "SUPERSEDED"
export type ReviewStatus = "APPROVED" | "CHANGES_REQUESTED"

/** A client's review of one deliverable version (API `DeliverableReview`). */
export type DeliverableReview = {
  id: string
  deliverableId: string
  status: ReviewStatus
  comment: string | null
  /** ISO date-times. */
  reviewedAt: string
  createdAt: string
}

export type Deliverable = {
  id: string
  projectId: string
  /** Denormalized for list rendering. */
  projectName: string
  clientId: string
  client: string
  /** Milestone this delivers against, if any (API `Deliverable.milestoneId`). */
  milestoneId: string | null
  milestoneTitle: string | null
  title: string
  description: string | null
  /** 1-based version; a new upload bumps this and supersedes the prior. */
  version: number
  /** Exactly one of `fileUrl` / `externalLink` is set (API allows either). */
  fileUrl: string | null
  /** Display convenience for file deliverables. */
  fileName: string | null
  fileSizeBytes: number | null
  externalLink: string | null
  status: DeliverableStatus
  /** ISO date-times (API `Deliverable.uploadedAt` / `createdAt` / `updatedAt`). */
  uploadedAt: string
  createdAt: string
  updatedAt: string
}

type FileSource = { fileName: string; fileSizeBytes: number }
type LinkSource = { externalLink: string }

/** Build a deliverable, denormalizing project/client + milestone and filling
 * timestamps (createdAt = updatedAt = uploadedAt for the seed). */
function dv(
  d: {
    id: string
    projectId: string
    milestoneId?: string
    title: string
    description?: string
    version: number
    status: DeliverableStatus
    uploadedAt: string
    source: FileSource | LinkSource
  }
): Deliverable {
  const project = getProject(d.projectId)
  const milestone = d.milestoneId
    ? project?.milestones.find((m) => m.id === d.milestoneId)
    : undefined
  const file = "fileName" in d.source ? d.source : null
  const externalLink = "externalLink" in d.source ? d.source.externalLink : null
  return {
    id: d.id,
    projectId: d.projectId,
    projectName: project?.name ?? "—",
    clientId: project?.clientId ?? "",
    client: project?.client ?? "—",
    milestoneId: d.milestoneId ?? null,
    milestoneTitle: milestone?.title ?? null,
    title: d.title,
    description: d.description ?? null,
    version: d.version,
    fileUrl: file ? `/files/${file.fileName}` : null,
    fileName: file ? file.fileName : null,
    fileSizeBytes: file ? file.fileSizeBytes : null,
    externalLink,
    status: d.status,
    uploadedAt: d.uploadedAt,
    createdAt: d.uploadedAt,
    updatedAt: d.uploadedAt,
  }
}

export const DELIVERABLES: Deliverable[] = [
  // Contoso — homepage design, superseded v1 (changes requested) → live v2.
  dv({
    id: "d-atlas-home-1",
    projectId: "p-atlas-1", milestoneId: "m-1",
    title: "Homepage design",
    description: "Desktop + mobile comps for the new marketing homepage.",
    version: 1, status: "SUPERSEDED", uploadedAt: "2024-05-06",
    source: { externalLink: "https://figma.com/file/atlas-home-v1" },
  }),
  dv({
    id: "d-atlas-home-2",
    projectId: "p-atlas-1", milestoneId: "m-1",
    title: "Homepage design",
    description: "Revised comps addressing the hero + navigation feedback.",
    version: 2, status: "READY", uploadedAt: "2024-05-22",
    source: { externalLink: "https://figma.com/file/atlas-home-v2" },
  }),
  dv({
    id: "d-atlas-designsystem-1",
    projectId: "p-atlas-1", milestoneId: "m-1",
    title: "Design system spec",
    description: "Tokens, components and usage — the source of truth for build.",
    version: 1, status: "READY", uploadedAt: "2024-05-02",
    source: { fileName: "atlas-design-system.pdf", fileSizeBytes: 4_820_000 },
  }),
  // Relecloud — launch hero set, changes requested (mirrors the TikTok revision).
  dv({
    id: "d-muse-hero-1",
    projectId: "p-muse-1", milestoneId: "m-0",
    title: "Launch hero set",
    description: "Six hero frames for the spring launch, 16:9 and 1:1.",
    version: 1, status: "READY", uploadedAt: "2024-07-18",
    source: { fileName: "muse-hero-set.zip", fileSizeBytes: 128_400_000 },
  }),
  // Northwind — moodboards, approved.
  dv({
    id: "d-north-mood-1",
    projectId: "p-north-1", milestoneId: "m-1",
    title: "Brand moodboards",
    description: "Three directions for the refresh — territory, type and colour.",
    version: 1, status: "READY", uploadedAt: "2024-03-18",
    source: { externalLink: "https://figma.com/file/northwind-moodboards" },
  }),
  // Fabrikam — storyboard + animatic.
  dv({
    id: "d-fable-storyboard-1",
    projectId: "p-fable-1", milestoneId: "m-0",
    title: "Sizzle storyboard",
    description: "Frame-by-frame board for the 45s launch sizzle.",
    version: 1, status: "READY", uploadedAt: "2024-07-24",
    source: { fileName: "fable-storyboard.pdf", fileSizeBytes: 9_200_000 },
  }),
  dv({
    id: "d-fable-animatic-1",
    projectId: "p-fable-1", milestoneId: "m-1",
    title: "Animatic v1",
    description: "Timed animatic with scratch audio for sign-off.",
    version: 1, status: "READY", uploadedAt: "2024-08-26",
    source: { fileName: "fable-animatic-v1.mp4", fileSizeBytes: 74_600_000 },
  }),
  // VanArsdel — packaging dielines.
  dv({
    id: "d-orch-dielines-1",
    projectId: "p-orch-1", milestoneId: "m-0",
    title: "Structural dielines",
    description: "Cut + fold dielines for the three-bottle carrier.",
    version: 1, status: "READY", uploadedAt: "2024-06-02",
    source: { fileName: "orchard-dielines.pdf", fileSizeBytes: 2_100_000 },
  }),
  // Woodgrove — final site, approved.
  dv({
    id: "d-harbor-site-1",
    projectId: "p-harbor-1", milestoneId: "m-3",
    title: "Final website build",
    description: "Staging build for review ahead of go-live.",
    version: 1, status: "READY", uploadedAt: "2023-12-01",
    source: { externalLink: "https://harbor-staging.vercel.app" },
  }),
]

/** Client reviews of the latest deliverable versions (API `DeliverableReview`).
 * One approval, two changes-requested — the latter drive the revision hand-off. */
export const DELIVERABLE_REVIEWS: DeliverableReview[] = [
  {
    id: "dr-atlas-home-1",
    deliverableId: "d-atlas-home-1",
    status: "CHANGES_REQUESTED",
    comment:
      "Love the direction. Can the hero feel warmer, and can we simplify the top navigation to five items?",
    reviewedAt: "2024-05-15", createdAt: "2024-05-15",
  },
  {
    id: "dr-atlas-ds-1",
    deliverableId: "d-atlas-designsystem-1",
    status: "APPROVED",
    comment: "Looks great — cleared to build against this.",
    reviewedAt: "2024-05-08", createdAt: "2024-05-08",
  },
  {
    id: "dr-muse-hero-1",
    deliverableId: "d-muse-hero-1",
    status: "CHANGES_REQUESTED",
    comment:
      "These are stunning. Could we also get 9:16 cutdowns for TikTok before the spring push?",
    reviewedAt: "2024-07-26", createdAt: "2024-07-26",
  },
  {
    id: "dr-north-mood-1",
    deliverableId: "d-north-mood-1",
    status: "APPROVED",
    comment: "Direction two is the one — let's run with it.",
    reviewedAt: "2024-03-25", createdAt: "2024-03-25",
  },
  {
    id: "dr-harbor-site-1",
    deliverableId: "d-harbor-site-1",
    status: "APPROVED",
    comment: null,
    reviewedAt: "2023-12-08", createdAt: "2023-12-08",
  },
]

/** Empty studio — no deliverables yet. Drives the empty state. */
export const EMPTY_DELIVERABLES: Deliverable[] = []

export function getDeliverable(id: string): Deliverable | undefined {
  return DELIVERABLES.find((d) => d.id === id)
}

export function deliverablesForProject(projectId: string): Deliverable[] {
  return DELIVERABLES.filter((d) => d.projectId === projectId)
}

/** All versions that share a title on the same project, oldest first (v1..vN). */
export function versionsOf(d: Deliverable): Deliverable[] {
  return DELIVERABLES.filter(
    (x) => x.projectId === d.projectId && x.title === d.title
  ).sort((a, b) => a.version - b.version)
}

/** The client's review of a deliverable, if one exists. */
export function reviewFor(deliverableId: string): DeliverableReview | undefined {
  return DELIVERABLE_REVIEWS.find((r) => r.deliverableId === deliverableId)
}

/** A deliverable is "awaiting review" when it's the live version and unreviewed. */
export function isAwaitingReview(d: Deliverable): boolean {
  return d.status === "READY" && !reviewFor(d.id)
}

/** Count of live deliverables still needing a client decision (nav badge). */
export function awaitingReviewCount(): number {
  return DELIVERABLES.filter(isAwaitingReview).length
}

/** Version-position badge — the framing users actually reason about. The live
 * version reads "Current version", a superseded one reads "Older version".
 * Returns null for a lone version: with nothing to compare against, the badge
 * would be noise (the review badge carries state instead). Derived from the API
 * `status` enum (READY = current, SUPERSEDED = older). */
export type VersionBadge = { label: string; variant: "success" | "secondary" }
export function versionBadge(d: Deliverable): VersionBadge | null {
  if (versionsOf(d).length <= 1) return null
  return d.status === "READY"
    ? { label: "Current version", variant: "success" }
    : { label: "Older version", variant: "secondary" }
}

export const DELIVERABLE_STATUS_LABEL: Record<DeliverableStatus, string> = {
  READY: "Ready",
  SUPERSEDED: "Superseded",
}

export const DELIVERABLE_STATUS_VARIANT: Record<
  DeliverableStatus,
  "success" | "secondary"
> = {
  READY: "success",
  SUPERSEDED: "secondary",
}

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
}

export const REVIEW_STATUS_VARIANT: Record<
  ReviewStatus,
  "success" | "warning"
> = {
  APPROVED: "success",
  CHANGES_REQUESTED: "warning",
}

/** Human file size, e.g. "4.8 MB". */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, i)
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

/** Whether a deliverable is previewable inline (image / PDF / video). */
export function fileKind(
  d: Deliverable
): "image" | "pdf" | "video" | "link" | "file" {
  if (d.externalLink) return "link"
  const name = d.fileName?.toLowerCase() ?? ""
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(name)) return "image"
  if (name.endsWith(".pdf")) return "pdf"
  if (/\.(mp4|mov|webm)$/.test(name)) return "video"
  return "file"
}
