/**
 * Per-domain endpoint builders — the only place raw URL strings live. Paths
 * include the `/api` prefix; the base host is set on the axios client.
 */

export const AuthEndpoints = {
  login: "/api/auth/login",
  verifyOtp: "/api/auth/verify-otp",
  register: "/api/auth/register",
  verifyEmail: "/api/auth/verify-email",
  me: "/api/auth/me",
}

/** Admin account management — super-admin only (the API 403s otherwise). */
export const AdminsEndpoints = {
  list: "/api/admins",
  byId: (id: string) => `/api/admins/${id}`,
  approve: (id: string) => `/api/admins/${id}/approve`,
  revoke: (id: string) => `/api/admins/${id}/revoke`,
  role: (id: string) => `/api/admins/${id}/role`,
  remove: (id: string) => `/api/admins/${id}`,
}

export const DeliverableEndpoints = {
  /** Admin: all deliverables (every version) for a project. */
  listByProject: (projectId: string) => `/api/projects/${projectId}/deliverables`,
  /** Admin: upload a new deliverable under a project. */
  create: (projectId: string) => `/api/projects/${projectId}/deliverables`,
  /** Admin: update a deliverable's metadata. */
  update: (id: string) => `/api/deliverables/${id}`,
  /** Admin: delete a deliverable. */
  remove: (id: string) => `/api/deliverables/${id}`,
}

export const ClientEndpoints = {
  list: "/api/clients",
  create: "/api/clients",
  byId: (id: string) => `/api/clients/${id}`,
  update: (id: string) => `/api/clients/${id}`,
  remove: (id: string) => `/api/clients/${id}`,
  sendPortalInvite: (id: string) => `/api/clients/${id}/send-portal-invite`,
}

export const ProjectEndpoints = {
  list: "/api/projects",
  create: "/api/projects",
  byId: (id: string) => `/api/projects/${id}`,
  update: (id: string) => `/api/projects/${id}`,
  remove: (id: string) => `/api/projects/${id}`,
  // milestones
  createMilestone: (id: string) => `/api/projects/${id}/milestones`,
  updateMilestone: (id: string, milestoneId: string) =>
    `/api/projects/${id}/milestones/${milestoneId}`,
  removeMilestone: (id: string, milestoneId: string) =>
    `/api/projects/${id}/milestones/${milestoneId}`,
  // updates
  createUpdate: (id: string) => `/api/projects/${id}/updates`,
  removeUpdate: (id: string, updateId: string) =>
    `/api/projects/${id}/updates/${updateId}`,
  // nested collections
  invoices: (id: string) => `/api/projects/${id}/invoices`,
  createInvoice: (id: string) => `/api/projects/${id}/invoices`,
}

export const InvoiceEndpoints = {
  byId: (id: string) => `/api/invoices/${id}`,
  update: (id: string) => `/api/invoices/${id}`,
  remove: (id: string) => `/api/invoices/${id}`,
  send: (id: string) => `/api/invoices/${id}/send`,
  markPaid: (id: string) => `/api/invoices/${id}/mark-paid`,
  markOverdue: (id: string) => `/api/invoices/${id}/mark-overdue`,
}

export const RevisionEndpoints = {
  list: "/api/revision-requests",
  byId: (id: string) => `/api/revision-requests/${id}`,
  updateStatus: (id: string) => `/api/revision-requests/${id}/status`,
  approve: (id: string) => `/api/revision-requests/${id}/approve`,
}

export const PageEndpoints = {
  list: "/api/pages",
  create: "/api/pages",
  byId: (id: string) => `/api/pages/${id}`,
  bySlug: (slug: string) => `/api/pages/slug/${slug}`,
  update: (id: string) => `/api/pages/${id}`,
  remove: (id: string) => `/api/pages/${id}`,
  createBlock: (id: string) => `/api/pages/${id}/blocks`,
  reorderBlocks: (id: string) => `/api/pages/${id}/blocks/reorder`,
  updateBlock: (id: string, blockId: string) =>
    `/api/pages/${id}/blocks/${blockId}`,
  removeBlock: (id: string, blockId: string) =>
    `/api/pages/${id}/blocks/${blockId}`,
}

export const MediaEndpoints = {
  list: "/api/media",
  upload: "/api/media/upload",
  remove: (id: string) => `/api/media/${id}`,
}

/** Client-facing portal (passwordless OTP session; client-scoped reads). */
export const PortalEndpoints = {
  requestOtp: "/api/portal/request-otp",
  verifyOtp: "/api/portal/verify-otp",
  logout: "/api/portal/logout",
  me: "/api/portal/me",
  projects: "/api/portal/projects",
  project: (id: string) => `/api/portal/projects/${id}`,
  projectDeliverables: (id: string) => `/api/portal/projects/${id}/deliverables`,
  projectRevisions: (id: string) => `/api/portal/projects/${id}/revision-requests`,
  revisions: "/api/portal/revision-requests",
  reviewDeliverable: (id: string) => `/api/portal/deliverables/${id}/review`,
}
