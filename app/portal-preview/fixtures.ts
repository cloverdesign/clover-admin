/**
 * DEV-ONLY fixtures for the portal design harness (app/portal-preview).
 * Shaped to `lib/api/models`, not `lib/mock` — these are seeded straight into
 * the portal query keys so the real components render without a live session.
 * Delete this directory once the portal design work lands.
 */

import type {
  Client,
  Project,
  Milestone,
  Invoice,
  Deliverable,
  RevisionRequest,
} from "@/lib/api/models"

const NOW = "2026-08-24T10:00:00.000Z"

export const CLIENT: Client = {
  id: "cl-1",
  name: "Dana Okafor",
  email: "dana@atlasfoods.com",
  phone: "+234 802 555 0134",
  company: "Atlas Foods",
  status: "ACTIVE",
  notes: null,
  createdAt: "2026-02-11T09:00:00.000Z",
  updatedAt: NOW,
}

function milestone(
  id: string,
  projectId: string,
  title: string,
  status: Milestone["status"],
  dueDate: string | null,
  order: number
): Milestone {
  return {
    id,
    projectId,
    title,
    description: null,
    status,
    order,
    dueDate,
    phase: null,
    completedAt: status === "COMPLETED" ? dueDate : null,
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: NOW,
  }
}

const P1_MILESTONES: Milestone[] = [
  milestone("m-1", "p-1", "Discovery workshop", "COMPLETED", "2026-04-10T00:00:00.000Z", 0),
  milestone("m-2", "p-1", "Brand direction sign-off", "COMPLETED", "2026-05-22T00:00:00.000Z", 1),
  milestone("m-3", "p-1", "Packaging system v1", "IN_PROGRESS", "2026-08-18T00:00:00.000Z", 2),
  milestone("m-4", "p-1", "Monthly content handover", "PENDING", "2026-09-04T00:00:00.000Z", 3),
  milestone("m-5", "p-1", "Launch assets", "PENDING", "2026-10-15T00:00:00.000Z", 4),
]

const P2_MILESTONES: Milestone[] = [
  milestone("m-6", "p-2", "Site architecture", "COMPLETED", "2026-06-30T00:00:00.000Z", 0),
  milestone("m-7", "p-2", "Homepage design", "IN_PROGRESS", "2026-09-12T00:00:00.000Z", 1),
  milestone("m-8", "p-2", "Build & QA", "PENDING", "2026-11-01T00:00:00.000Z", 2),
]

const P3_MILESTONES: Milestone[] = [
  milestone("m-9", "p-3", "Extra photography set", "PENDING", "2026-09-26T00:00:00.000Z", 0),
]

function project(p: Partial<Project> & Pick<Project, "id" | "name">): Project {
  return {
    clientId: "cl-1",
    parentProjectId: null,
    type: "Brand identity",
    description: null,
    phase: "Design",
    status: "IN_PROGRESS",
    progress: 50,
    currency: "NGN",
    totalValue: 0,
    budget: null,
    startDate: "2026-03-02T00:00:00.000Z",
    endDate: "2026-10-30T00:00:00.000Z",
    archived: false,
    notes: null,
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: NOW,
    ...p,
  } as Project
}

/** List-endpoint shape. The real portal list embeds milestones, updates and
 * invoices (verified live 2026-08-28) — milestones are merged in below so the
 * harness matches. */
const PROJECTS_BASE: Project[] = [
  project({
    id: "p-1",
    name: "Atlas Foods rebrand",
    type: "Brand identity",
    phase: "Design",
    description:
      "Full identity refresh across packaging, in-store and digital. Includes a packaging system for the six core SKUs and a rollout kit for the retail team.",
    progress: 62,
    totalValue: 8_400_000,
  }),
  project({
    id: "p-2",
    name: "Marketing site build",
    type: "Website",
    phase: "Development",
    description:
      "New marketing site on the refreshed identity — six pages, CMS-driven case studies, and a wholesale enquiry flow.",
    progress: 34,
    totalValue: 5_200_000,
    startDate: "2026-06-01T00:00:00.000Z",
    endDate: "2026-12-15T00:00:00.000Z",
  }),
  project({
    id: "p-3",
    name: "Packaging photography",
    parentProjectId: "p-1",
    type: "Photography",
    phase: "Discovery",
    status: "PLANNING",
    description: "Additional studio set for the two SKUs added after sign-off.",
    progress: 8,
    totalValue: 1_150_000,
    startDate: "2026-08-10T00:00:00.000Z",
    endDate: "2026-09-30T00:00:00.000Z",
  }),
]

const MILESTONES_BY_PROJECT: Record<string, Milestone[]> = {
  "p-1": P1_MILESTONES,
  "p-2": P2_MILESTONES,
  "p-3": P3_MILESTONES,
}

export const PROJECTS: Project[] = PROJECTS_BASE.map((p) => ({
  ...p,
  milestones: MILESTONES_BY_PROJECT[p.id] ?? [],
}))

/** Detail read — same shape as the list here; the real one also embeds
 * deliverables and revision requests, which the harness seeds separately. */
export const PROJECT_DETAIL: Record<string, Project> = Object.fromEntries(
  PROJECTS.map((p) => [p.id, p])
)

export const INVOICES: Record<string, Invoice[]> = {
  "p-1": [
    {
      id: "i-1",
      projectId: "p-1",
      invoiceNumber: "CLV-0041",
      amount: 2_800_000,
      currency: "NGN",
      lineItems: [{ description: "Discovery & strategy", quantity: 1, unitPrice: 2_800_000 }],
      description: "Phase one — discovery",
      status: "PAID",
      issuedDate: "2026-03-05T00:00:00.000Z",
      dueDate: "2026-03-19T00:00:00.000Z",
      paidDate: "2026-03-14T00:00:00.000Z",
      pdfUrl: "#",
      createdAt: "2026-03-05T00:00:00.000Z",
      updatedAt: "2026-03-14T00:00:00.000Z",
    },
    {
      id: "i-2",
      projectId: "p-1",
      invoiceNumber: "CLV-0058",
      amount: 2_800_000,
      currency: "NGN",
      lineItems: [{ description: "Identity system", quantity: 1, unitPrice: 2_800_000 }],
      description: "Phase two — identity",
      status: "OVERDUE",
      issuedDate: "2026-07-14T00:00:00.000Z",
      dueDate: "2026-08-11T00:00:00.000Z",
      paidDate: null,
      pdfUrl: "#",
      createdAt: "2026-07-14T00:00:00.000Z",
      updatedAt: "2026-08-12T00:00:00.000Z",
    },
  ],
  "p-2": [
    {
      id: "i-3",
      projectId: "p-2",
      invoiceNumber: "CLV-0063",
      amount: 1_733_000,
      currency: "NGN",
      lineItems: [
        { description: "Design sprint", quantity: 2, unitPrice: 620_000 },
        { description: "Front-end build", quantity: 1, unitPrice: 493_000 },
      ],
      description: "Milestone one",
      status: "SENT",
      issuedDate: "2026-08-18T00:00:00.000Z",
      dueDate: "2026-09-01T00:00:00.000Z",
      paidDate: null,
      pdfUrl: "#",
      createdAt: "2026-08-18T00:00:00.000Z",
      updatedAt: "2026-08-18T00:00:00.000Z",
    },
  ],
  "p-3": [],
}

export const DELIVERABLES: Record<string, Deliverable[]> = {
  "p-1": [
    {
      id: "d-1",
      projectId: "p-1",
      milestoneId: "m-2",
      title: "Brand direction — routes A/B/C",
      description: "Three directions with rationale. Comments welcome on any of them.",
      version: 2,
      fileUrl: "#",
      externalLink: null,
      status: "READY",
      uploadedAt: "2026-08-21T14:30:00.000Z",
      createdAt: "2026-08-21T14:30:00.000Z",
      updatedAt: "2026-08-21T14:30:00.000Z",
    },
    {
      id: "d-2",
      projectId: "p-1",
      milestoneId: "m-3",
      title: "Packaging dielines",
      description: null,
      version: 1,
      fileUrl: null,
      externalLink: "https://www.figma.com/file/example",
      status: "READY",
      uploadedAt: "2026-08-12T09:05:00.000Z",
      createdAt: "2026-08-12T09:05:00.000Z",
      updatedAt: "2026-08-12T09:05:00.000Z",
    },
    {
      id: "d-3",
      projectId: "p-1",
      milestoneId: "m-2",
      title: "Brand direction — routes A/B/C",
      description: null,
      version: 1,
      fileUrl: "#",
      externalLink: null,
      status: "SUPERSEDED",
      uploadedAt: "2026-07-30T11:00:00.000Z",
      createdAt: "2026-07-30T11:00:00.000Z",
      updatedAt: "2026-08-21T14:30:00.000Z",
    },
  ],
  "p-2": [
    {
      id: "d-4",
      projectId: "p-2",
      milestoneId: "m-7",
      title: "Homepage staging build",
      description: "Live staging link — desktop and mobile.",
      version: 1,
      fileUrl: null,
      externalLink: "https://atlas-staging.vercel.app",
      status: "READY",
      uploadedAt: "2026-08-23T16:40:00.000Z",
      createdAt: "2026-08-23T16:40:00.000Z",
      updatedAt: "2026-08-23T16:40:00.000Z",
    },
  ],
  "p-3": [],
}

export const REVISIONS: RevisionRequest[] = [
  {
    id: "r-1",
    projectId: "p-1",
    clientId: "cl-1",
    description:
      "Can we add two more SKUs to the packaging system? The tomato paste and the chilli oil launched after we signed off.",
    targetTimeframe: "Before the end of September",
    attachments: [],
    status: "APPROVED",
    resultingProjectId: "p-3",
    resultingPhaseNote: null,
    decisionNote: "Spinning this up as its own project so it doesn't hold up the rebrand.",
    deliverableId: null,
    createdAt: "2026-08-04T08:20:00.000Z",
    updatedAt: "2026-08-09T12:00:00.000Z",
  },
  {
    id: "r-2",
    projectId: "p-2",
    clientId: "cl-1",
    description:
      "The wholesale enquiry form should capture company size — our sales team needs it to route leads.",
    targetTimeframe: null,
    attachments: [],
    status: "REQUESTED",
    createdAt: "2026-08-22T15:10:00.000Z",
    updatedAt: "2026-08-22T15:10:00.000Z",
    resultingProjectId: null,
    resultingPhaseNote: null,
    decisionNote: null,
    deliverableId: "d-4",
  },
]
