/**
 * Typed dummy data for the admin Clients area — the single source the layout
 * prototypes render against. Shapes track the PRD's core entities (§1.3):
 * a Client is thin (company/contact/email/phone); everything quantitative
 * (value, phase, status) lives on their Projects, so list metrics are derived.
 *
 * Swap this module for real API calls later.
 */

import type { Phase } from "@/lib/mock/dashboard"
import { convert, getCurrency } from "@/lib/mock/currencies"

/** Derived from a client's projects, not stored (§1.4 "filter by status"). */
/** Client lifecycle status (Clover CMS API `Client.status`). */
export type ClientStatus =
  | "LEAD"
  | "ONBOARDING"
  | "ACTIVE"
  | "ON_HOLD"
  | "CHURNED"

export type ClientProjectStatus =
  | "on-track"
  | "at-risk"
  | "kickoff"
  | "completed"

/** A project as summarized on the client surfaces (full detail lives elsewhere). */
export type ClientProject = {
  id: string
  name: string
  phase: Phase
  status: ClientProjectStatus
  /** Amount in the project's own currency. */
  value: number
  currency: string
}

export type Client = {
  id: string
  company: string
  contactName: string
  /** Contact email — the client's portal auth identity (§1.1). */
  email: string
  phone?: string
  location?: string
  status: ClientStatus
  /** Client's billing currency; also the currency of `outstanding`. */
  currency: string
  /** When they were onboarded, e.g. "Mar 2024". */
  since: string
  projects: ClientProject[]
  /** Unpaid invoiced amount in `currency`. */
  outstanding: number
  openInvoices: number
  /** Relative last-touch, e.g. "2h ago". */
  lastActivity: string
  /** Hours since last activity — for sorting. */
  lastActivityHours: number
}

export const CLIENTS: Client[] = [
  {
    id: "c-atlas",
    company: "Atlas Foods",
    contactName: "Dana Okafor",
    email: "dana@atlasfoods.com",
    phone: "+1 (415) 555-0142",
    location: "San Francisco, US",
    status: "ACTIVE",
    currency: "USD",
    since: "Mar 2024",
    outstanding: 12000,
    openInvoices: 1,
    lastActivity: "2h ago",
    lastActivityHours: 2,
    projects: [
      { id: "p-atlas-1", name: "Site build", phase: "Development", status: "at-risk", value: 52000, currency: "USD" },
      { id: "p-atlas-2", name: "Brand system", phase: "Launch", status: "completed", value: 28000, currency: "USD" },
    ],
  },
  {
    id: "c-northwind",
    company: "Northwind",
    contactName: "Priya Raman",
    email: "priya@northwind.co",
    phone: "+1 (212) 555-0177",
    location: "New York, US",
    status: "ACTIVE",
    currency: "USD",
    since: "Jan 2024",
    outstanding: 12000,
    openInvoices: 1,
    lastActivity: "3d ago",
    lastActivityHours: 72,
    projects: [
      { id: "p-north-1", name: "Brand refresh", phase: "Design", status: "on-track", value: 24000, currency: "USD" },
    ],
  },
  {
    id: "c-kite",
    company: "Kite",
    contactName: "Sam Ellison",
    email: "sam@kite.studio",
    phone: "+44 20 7946 0321",
    location: "London, UK",
    status: "ACTIVE",
    currency: "GBP",
    since: "Feb 2024",
    outstanding: 0,
    openInvoices: 0,
    lastActivity: "5h ago",
    lastActivityHours: 5,
    projects: [
      { id: "p-kite-1", name: "Identity", phase: "Discovery", status: "on-track", value: 12000, currency: "GBP" },
    ],
  },
  {
    id: "c-muse",
    company: "Muse",
    contactName: "Elena Fischer",
    email: "elena@muse.io",
    phone: "+1 (310) 555-0190",
    location: "Los Angeles, US",
    status: "ACTIVE",
    currency: "USD",
    since: "Apr 2024",
    outstanding: 6400,
    openInvoices: 1,
    lastActivity: "1d ago",
    lastActivityHours: 24,
    projects: [
      { id: "p-muse-1", name: "Campaign", phase: "Launch", status: "on-track", value: 18000, currency: "USD" },
    ],
  },
  {
    id: "c-verde",
    company: "Verde Studio",
    contactName: "João Pereira",
    email: "joao@verde.pt",
    phone: "+351 21 123 4567",
    location: "Lisbon, PT",
    status: "ONBOARDING",
    currency: "EUR",
    since: "Jun 2025",
    outstanding: 0,
    openInvoices: 0,
    lastActivity: "6h ago",
    lastActivityHours: 6,
    projects: [
      { id: "p-verde-1", name: "Rebrand", phase: "Kickoff", status: "kickoff", value: 30000, currency: "EUR" },
    ],
  },
  {
    id: "c-orchard",
    company: "Orchard",
    contactName: "Maya Lin",
    email: "maya@orchard.com",
    phone: "+1 (503) 555-0155",
    location: "Portland, US",
    status: "ACTIVE",
    currency: "USD",
    since: "May 2024",
    outstanding: 0,
    openInvoices: 0,
    lastActivity: "2d ago",
    lastActivityHours: 48,
    projects: [
      { id: "p-orch-1", name: "Packaging", phase: "Design", status: "on-track", value: 16000, currency: "USD" },
    ],
  },
  {
    id: "c-lumen",
    company: "Lumen",
    contactName: "Nils Bauer",
    email: "nils@lumen.de",
    phone: "+49 30 1234 5678",
    location: "Berlin, DE",
    status: "ACTIVE",
    currency: "EUR",
    since: "Nov 2023",
    outstanding: 20000,
    openInvoices: 2,
    lastActivity: "4h ago",
    lastActivityHours: 4,
    projects: [
      { id: "p-lumen-1", name: "Web app", phase: "Development", status: "at-risk", value: 64000, currency: "EUR" },
    ],
  },
  {
    id: "c-fable",
    company: "Fable",
    contactName: "Ada Brooks",
    email: "ada@fable.tv",
    location: "Austin, US",
    status: "ON_HOLD",
    currency: "USD",
    since: "Jul 2024",
    outstanding: 0,
    openInvoices: 0,
    lastActivity: "1d ago",
    lastActivityHours: 26,
    projects: [
      { id: "p-fable-1", name: "Motion reel", phase: "Design", status: "on-track", value: 9000, currency: "USD" },
    ],
  },
  {
    id: "c-kestrel",
    company: "Kestrel",
    contactName: "Owen Vance",
    email: "owen@kestrel.app",
    location: "Denver, US",
    status: "LEAD",
    currency: "USD",
    since: "Jul 2025",
    outstanding: 0,
    openInvoices: 0,
    lastActivity: "1w ago",
    lastActivityHours: 168,
    projects: [],
  },
  {
    id: "c-sable",
    company: "Sable",
    contactName: "Ifeoma Umeh",
    email: "ifeoma@sable.ng",
    phone: "+234 1 234 5678",
    location: "Lagos, NG",
    status: "LEAD",
    currency: "NGN",
    since: "Jul 2025",
    outstanding: 0,
    openInvoices: 0,
    lastActivity: "3d ago",
    lastActivityHours: 70,
    projects: [],
  },
  {
    id: "c-harbor",
    company: "Harbor & Co",
    contactName: "Grace Yoon",
    email: "grace@harbor.co",
    phone: "+1 (206) 555-0128",
    location: "Seattle, US",
    status: "CHURNED",
    currency: "USD",
    since: "Aug 2023",
    outstanding: 0,
    openInvoices: 0,
    lastActivity: "2mo ago",
    lastActivityHours: 1460,
    projects: [
      { id: "p-harbor-1", name: "Website", phase: "Launch", status: "completed", value: 34000, currency: "USD" },
    ],
  },
  {
    id: "c-tidewater",
    company: "Tidewater",
    contactName: "Marcus Reed",
    email: "marcus@tidewater.com",
    location: "Miami, US",
    status: "CHURNED",
    currency: "USD",
    since: "Feb 2023",
    outstanding: 0,
    openInvoices: 0,
    lastActivity: "6mo ago",
    lastActivityHours: 4380,
    projects: [
      { id: "p-tide-1", name: "Landing page", phase: "Launch", status: "completed", value: 8000, currency: "USD" },
    ],
  },
]

/** Empty studio — no clients onboarded yet. Drives the empty state. */
export const EMPTY_CLIENTS: Client[] = []

/** Look up one client by id. */
export function getClient(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id)
}

/** Client portal access state (§1.1). Derived from the client for now — a
 * prospect hasn't been invited; anyone with work has active portal access. */
export type PortalStatus = "active" | "invited" | "not-invited"

export function portalStatus(client: Client): PortalStatus {
  if (client.status === "LEAD") return "not-invited"
  if (client.status === "ONBOARDING") return "invited"
  return "active"
}

export const PORTAL_LABEL: Record<PortalStatus, string> = {
  active: "Portal active",
  invited: "Invite pending",
  "not-invited": "Not invited",
}

/** Sum of a client's project values, converted into `display` currency. */
export function clientTotalValue(client: Client, display: string): number {
  return client.projects.reduce(
    (sum, p) => sum + convert(p.value, p.currency, display),
    0
  )
}

/** Count of a client's non-completed projects. */
export function activeProjectCount(client: Client): number {
  return client.projects.filter((p) => p.status !== "completed").length
}

/** Compact money, e.g. "$52k", "€1.2k", "₦480k". Rounds; no live rates. */
export function formatMoney(amount: number, code: string): string {
  const symbol = getCurrency(code)?.symbol ?? ""
  const abs = Math.abs(amount)
  let body: string
  if (abs >= 1_000_000) body = `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  else if (abs >= 1000) body = `${(amount / 1000).toFixed(abs >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k`
  else body = String(Math.round(amount))
  return `${symbol}${body}`
}

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  LEAD: "Lead",
  ONBOARDING: "Onboarding",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  CHURNED: "Churned",
}
