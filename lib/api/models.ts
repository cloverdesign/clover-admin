/**
 * API-shaped domain models — exact to `docs/api/openapi.json`, not the richer
 * denormalized shapes in `lib/mock`. As screens migrate off the mock onto the
 * live API, they move to these types. Reference slice: Deliverable.
 */

export type DeliverableStatus = "READY" | "SUPERSEDED"

export type DeliverableReviewStatusValue = "APPROVED" | "CHANGES_REQUESTED"

/** The client's verdict on one deliverable version. Returned embedded on portal
 * deliverable reads only — admin reads never populate it, which is why the
 * dashboard still has no pending-reviews panel. */
export interface DeliverableReview {
  id: string
  deliverableId: string
  status: DeliverableReviewStatusValue
  comment: string | null
  reviewedAt: string
  createdAt: string
}

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
  /** Present on portal reads only — see `DeliverableReview`. */
  review?: DeliverableReview | null
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
  /** Relations the API embeds. The portal list and detail reads both carry
   * milestones, updates and invoices; portal detail adds deliverables and
   * revision requests. Optional because the admin list read carries none — for
   * a guaranteed admin read use the dedicated collection endpoints
   * (`useProjectMilestones` / `useProjectUpdates` / `useProjectInvoices`). */
  milestones?: Milestone[]
  updates?: ProjectUpdatePost[]
  invoices?: Invoice[]
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

/** Update body — no clientId/parentProjectId (fixed at creation). All fields
 * optional: the API's PUT is a partial update, so callers can send just the
 * fields they're changing (e.g. `{ progress }`). */
export type ProjectUpdateInput = Partial<Omit<ProjectInput, "clientId" | "parentProjectId">>

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
  /** Phase label this milestone belongs to. Written by the revision approve
   * flow when it scaffolds a new phase; null on milestones added directly. */
  phase: string | null
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

/** A billed line. The API models every line as quantity x unit price, so the
 * line's money value is `quantity * unitPrice` — there is no `amount` field.
 * Use `lineTotal()` from lib/mock/invoices rather than recomputing it. */
export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
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
  /** Required by the API — POSTing without it 400s with a bare "Required". */
  dueDate: string
  issuedDate?: string
}

/* --------------------------------------------------------- revision requests */

export type RevisionStatus = "REQUESTED" | "IN_REVIEW" | "APPROVED" | "DECLINED"

/** A client-attached reference on a revision request (docs/backend-requests §7c). */
export interface RevisionAttachment {
  url: string
  name: string
}

export interface RevisionRequest {
  id: string
  projectId: string
  clientId: string
  description: string
  targetTimeframe: string | null
  attachments: RevisionAttachment[]
  status: RevisionStatus
  resultingProjectId: string | null
  /** @deprecated superseded by `decisionNote` (backend-requests §7b). */
  resultingPhaseNote: string | null
  /** Admin's message on a terminal decision — decline reason or phase note (§7b). */
  decisionNote: string | null
  /** Set when promoted from a deliverable's "request changes" (§7d). */
  deliverableId: string | null
  createdAt: string
  updatedAt: string
}

export interface RevisionStatusInput {
  status: RevisionStatus
  /** Reason/message surfaced to the client (§7b). */
  decisionNote?: string
}

/** One milestone authored inline when approving as a new phase (§7a). */
export interface RevisionPhaseMilestoneInput {
  title: string
  dueDate?: string
}

/** Approve → scaffold as a new phase on the same project, or a new project. */
export interface RevisionApproveInput {
  type: "new_phase" | "new_project"
  // new_project
  projectName?: string
  projectDescription?: string
  // new_phase — authored inline at approval (§7a)
  phase?: string
  milestones?: RevisionPhaseMilestoneInput[]
  endDate?: string
  /** Shown to the client alongside the approval, and included in the email the
   * API sends them. Same field the decline path uses. */
  decisionNote?: string
}

/* --------------------------------------------------------------------- auth */

export type AdminRole = "SUPER_ADMIN" | "ADMIN"

/** Clover CMS API `Admin`. `emailVerified` and `approved` gate access: an admin
 * must verify their email to sign in, and be approved to use any resource. */
export interface Admin {
  id: string
  name: string
  email: string
  role: AdminRole
  emailVerified: boolean
  approved: boolean
  createdAt: string
  updatedAt: string
}

/** Result of the token-minting steps (`verify-otp`, `verify-email`) — a 7-day
 * admin JWT plus the admin record. */
export interface AdminAuthResult {
  token: string
  admin: Admin
}

/** `POST /api/auth/login` — step 1: validate password, email an OTP. */
export interface LoginCredentialsInput {
  email: string
  password: string
}

/** `POST /api/auth/verify-otp` — step 2: exchange the emailed OTP for a JWT. */
export interface LoginOtpVerifyInput {
  email: string
  otp: string
}

/** `POST /api/auth/register`. */
export interface RegisterInput {
  name: string
  email: string
  password: string
}

/** `POST /api/auth/verify-email` — verify via the token from the email link. */
export interface EmailVerifyInput {
  token: string
}

/** `PUT /api/admins/{id}/role` — promote to super admin or demote to admin. */
export interface AdminRoleInput {
  role: AdminRole
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

/* ------------------------------------------------------------- client portal */

/** `POST /api/portal/request-otp` — start passwordless login. */
export interface PortalOtpRequestInput {
  email: string
}

/** `POST /api/portal/verify-otp` — exchange the emailed code for a session. */
export interface PortalOtpVerifyInput {
  email: string
  code: string
}

/** `verify-otp` data — a 30-day bearer token plus the signed-in client. */
export interface PortalSession {
  token: string
  client: Client
}

export type DeliverableReviewStatus = "APPROVED" | "CHANGES_REQUESTED"

/** `POST /api/portal/deliverables/{id}/review`. */
export interface DeliverableReviewInput {
  status: DeliverableReviewStatus
  /** Required when requesting changes. */
  comment?: string
}

/** `POST /api/portal/projects/{id}/revision-requests`. */
export interface PortalRevisionRequestInput {
  description: string
  targetTimeframe?: string
  attachments?: { url: string; name: string }[]
  /** Set when raised from a deliverable's "request changes" (§7d). */
  deliverableId?: string
}

/** `PUT /api/portal/me` — the client-editable subset of their profile. */
export interface ClientProfileInput {
  name?: string
  email?: string
  phone?: string
  company?: string
}

/**
 * Notifications — server-generated alerts for things needing an admin's
 * attention. The backend derives these from domain signals (overdue invoices,
 * incoming revision requests, deliverables awaiting review, milestones coming
 * due) and returns them newest-first from `GET /api/notifications`, capped at
 * the 50 most recent.
 *
 * Read state is the server's, per admin (`read`), flipped via
 * `PATCH /api/notifications/{id}/read` and `POST /api/notifications/read-all`.
 * There is no unread-count endpoint — count unread rows client-side.
 */
export type NotificationType =
  | "INVOICE_OVERDUE"
  | "REVISION_REQUESTED"
  | "DELIVERABLE_REVIEW"
  | "MILESTONE_DUE"

export interface Notification {
  id: string
  type: NotificationType
  /** Short headline, e.g. "Invoice overdue". */
  title: string
  /** One-line context, e.g. "Acme Co · $4,200 · 3 days late". */
  body: string | null
  /** In-app deep link the notification navigates to when clicked. Nullable —
   * a notification without one is still shown, just not clickable. */
  href: string | null
  /** Optional linkage to the originating entity (for grouping / icons). */
  entityType:
    | "invoice"
    | "revision"
    | "deliverable"
    | "milestone"
    | "project"
    | null
  entityId: string | null
  /** Whether the calling admin has read this one. Server-held, so it follows
   * the admin across devices. */
  read: boolean
  createdAt: string
}
