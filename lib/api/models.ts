/**
 * API-shaped domain models — exact to `docs/api/openapi.json`, not the richer
 * denormalized shapes in `lib/mock`. As screens migrate off the mock onto the
 * live API, they move to these types. Reference slice: Deliverable.
 */

export type DeliverableStatus = "READY" | "SUPERSEDED"

/** Clover CMS API `Deliverable`. Note: no denormalized project/client name,
 * file size, or embedded review — the admin API doesn't return those. */
export interface Deliverable {
  id: string
  projectId: string
  milestoneId: string | null
  title: string
  description: string | null
  version: number
  fileUrl: string | null
  externalLink: string | null
  status: DeliverableStatus
  uploadedAt: string
  createdAt: string
  updatedAt: string
}

/** Body for create/update (`POST /api/projects/{id}/deliverables`, `PUT
 * /api/deliverables/{id}`). Send a file URL or an external link. */
export interface DeliverableInput {
  title: string
  description?: string
  fileUrl?: string
  externalLink?: string
  milestoneId?: string
}

/* ------------------------------------------------------------------ clients */

export type ClientStatus =
  | "LEAD"
  | "ONBOARDING"
  | "ACTIVE"
  | "ON_HOLD"
  | "CHURNED"

export interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  company: string
  status: ClientStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientInput {
  name: string
  email: string
  company: string
  phone?: string
  notes?: string
  status?: ClientStatus
}

/* ----------------------------------------------------------------- projects */

export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED"

export interface Project {
  id: string
  clientId: string
  parentProjectId: string | null
  name: string
  type: string
  description: string | null
  phase: string
  status: ProjectStatus
  progress: number
  currency: string
  totalValue: number
  budget: number | null
  startDate: string | null
  endDate: string | null
  archived: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  clientId: string
  name: string
  type?: string
  description?: string
  phase?: string
  status?: ProjectStatus
  progress?: number
  currency?: string
  totalValue?: number
  budget?: number
  startDate?: string
  endDate?: string
  archived?: boolean
  notes?: string
  parentProjectId?: string
}

/** Update body — no clientId/parentProjectId (those are fixed at creation). */
export type ProjectUpdateInput = Omit<ProjectInput, "clientId" | "parentProjectId">

/* --------------------------------------------------------------- milestones */

export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED"

export interface Milestone {
  id: string
  projectId: string
  title: string
  description: string | null
  status: MilestoneStatus
  order: number
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface MilestoneInput {
  title: string
  description?: string
  status?: MilestoneStatus
  order?: number
  dueDate?: string
}

/* ---------------------------------------------------------- project updates */

export interface ProjectUpdatePost {
  id: string
  projectId: string
  title: string
  content: string
  isVisible: boolean
  createdAt: string
}

export interface ProjectUpdatePostInput {
  title: string
  content: string
  isVisible?: boolean
}

/* ----------------------------------------------------------------- invoices */

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE"

export interface InvoiceLineItem {
  description: string
  amount: number
}

export interface Invoice {
  id: string
  projectId: string
  invoiceNumber: string
  amount: number
  currency: string
  lineItems: InvoiceLineItem[]
  description: string | null
  status: InvoiceStatus
  issuedDate: string | null
  dueDate: string | null
  paidDate: string | null
  pdfUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface InvoiceInput {
  amount: number
  currency: string
  description?: string
  lineItems: InvoiceLineItem[]
  dueDate?: string
  issuedDate?: string
}

/* --------------------------------------------------------- revision requests */

export type RevisionStatus = "REQUESTED" | "IN_REVIEW" | "APPROVED" | "DECLINED"

export interface RevisionRequest {
  id: string
  projectId: string
  clientId: string
  description: string
  targetTimeframe: string | null
  attachments: unknown[]
  status: RevisionStatus
  resultingProjectId: string | null
  resultingPhaseNote: string | null
  createdAt: string
  updatedAt: string
}

export interface RevisionStatusInput {
  status: RevisionStatus
  resultingPhaseNote?: string
}

/** Approve → scaffold as a new phase on the same project, or a new project. */
export interface RevisionApproveInput {
  type: "PHASE" | "PROJECT"
  projectName?: string
  projectDescription?: string
  phaseNote?: string
}

/* --------------------------------------------------------------------- auth */

/** Clover CMS API `Admin` (minimal — what the app reads). */
export interface Admin {
  id: string
  name: string
  email: string
}

/** `POST /api/auth/login` `data` payload. Shape is loosely specced as an
 * object; we read the token defensively. */
export interface LoginResult {
  token?: string
  accessToken?: string
  admin?: Admin
}

/* ------------------------------------------------------------- cms: pages */

export type PageBlockType =
  | "HEADING"
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "BUTTON"
  | "DIVIDER"
  | "EMBED"
  | "SPACER"
  | "COLUMNS"

export interface PageBlock {
  id: string
  pageId: string
  type: PageBlockType
  order: number
  /** Shape varies by block type. */
  content: Record<string, unknown>
  styles: Record<string, unknown>
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export interface Page {
  id: string
  slug: string
  title: string
  description: string | null
  metaTitle: string | null
  metaDesc: string | null
  isPublished: boolean
  blocks: PageBlock[]
  createdAt: string
  updatedAt: string
}

export interface PageInput {
  slug: string
  title: string
  description?: string
  metaTitle?: string
  metaDesc?: string
  isPublished?: boolean
}

export interface PageBlockInput {
  type: PageBlockType
  content: Record<string, unknown>
  styles?: Record<string, unknown>
  isVisible?: boolean
  order?: number
}

/* ------------------------------------------------------------- cms: media */

export type MediaType = "IMAGE" | "VIDEO" | "DOCUMENT"

export interface MediaAsset {
  id: string
  filename: string
  originalName: string
  url: string
  type: MediaType
  mimeType: string
  size: number
  createdAt: string
}
