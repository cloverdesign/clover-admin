/**
 * Typed dummy data for the admin Invoices area (PRD §1.2.3, §1.3 "Invoice").
 * An invoice belongs to a project (and, through it, a client); it carries a
 * number, currency amount, status, issue/due/paid dates and line items. The set
 * is kept consistent with each client's `outstanding` / `openInvoices` in
 * `clients.ts` — sent + overdue invoices are the "open" ones.
 *
 * Swap this module for real API calls later.
 */

import { convert, getCurrency } from "@/lib/mock/currencies"
import { formatMoney } from "@/lib/mock/clients"

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE"

export type LineItem = {
  description: string
  /** Amount in the invoice's currency. */
  amount: number
}

export type Invoice = {
  id: string
  /** Human invoice number, e.g. "INV-2024-014". */
  number: string
  clientId: string
  client: string
  projectId: string
  projectName: string
  status: InvoiceStatus
  currency: string
  /** Total, in `currency` — the sum of `lineItems`. */
  amount: number
  lineItems: LineItem[]
  /** Display dates, e.g. "Jul 12, 2024". */
  issued: string
  due: string
  paidDate?: string
  /** Sort key — lower is more recent. */
  ageDays: number
}

/** Build an invoice, summing line items into the total. */
function inv(
  i: Omit<Invoice, "amount"> & { lineItems: LineItem[] }
): Invoice {
  return { ...i, amount: i.lineItems.reduce((s, l) => s + l.amount, 0) }
}

export const INVOICES: Invoice[] = [
  inv({
    id: "inv-atlas-site-1", number: "INV-2024-014",
    clientId: "c-atlas", client: "Atlas Foods",
    projectId: "p-atlas-1", projectName: "Site build",
    status: "OVERDUE", currency: "USD",
    issued: "Jun 12, 2024", due: "Jul 12, 2024", ageDays: 52,
    lineItems: [
      { description: "Design system — milestone 2", amount: 8000 },
      { description: "Frontend build — deposit", amount: 4000 },
    ],
  }),
  inv({
    id: "inv-atlas-site-2", number: "INV-2024-021",
    clientId: "c-atlas", client: "Atlas Foods",
    projectId: "p-atlas-1", projectName: "Site build",
    status: "DRAFT", currency: "USD",
    issued: "Aug 01, 2024", due: "Aug 31, 2024", ageDays: 2,
    lineItems: [{ description: "CMS integration — milestone", amount: 20000 }],
  }),
  inv({
    id: "inv-atlas-brand", number: "INV-2024-006",
    clientId: "c-atlas", client: "Atlas Foods",
    projectId: "p-atlas-2", projectName: "Brand system",
    status: "PAID", currency: "USD",
    issued: "Mar 20, 2024", due: "Apr 19, 2024", paidDate: "Apr 10, 2024", ageDays: 136,
    lineItems: [{ description: "Brand system — full", amount: 28000 }],
  }),
  inv({
    id: "inv-north-1", number: "INV-2024-018",
    clientId: "c-northwind", client: "Northwind",
    projectId: "p-north-1", projectName: "Brand refresh",
    status: "SENT", currency: "USD",
    issued: "Jul 05, 2024", due: "Aug 04, 2024", ageDays: 29,
    lineItems: [
      { description: "Discovery + strategy", amount: 8000 },
      { description: "Moodboards", amount: 4000 },
    ],
  }),
  inv({
    id: "inv-kite-1", number: "INV-2024-004",
    clientId: "c-kite", client: "Kite",
    projectId: "p-kite-1", projectName: "Identity",
    status: "PAID", currency: "GBP",
    issued: "Feb 28, 2024", due: "Mar 29, 2024", paidDate: "Mar 12, 2024", ageDays: 157,
    lineItems: [{ description: "Brand strategy — deposit", amount: 4000 }],
  }),
  inv({
    id: "inv-muse-1", number: "INV-2024-019",
    clientId: "c-muse", client: "Muse",
    projectId: "p-muse-1", projectName: "Campaign",
    status: "SENT", currency: "USD",
    issued: "Jul 15, 2024", due: "Aug 14, 2024", ageDays: 19,
    lineItems: [{ description: "Campaign — production", amount: 6400 }],
  }),
  inv({
    id: "inv-verde-1", number: "INV-2025-003",
    clientId: "c-verde", client: "Verde Studio",
    projectId: "p-verde-1", projectName: "Rebrand",
    status: "DRAFT", currency: "EUR",
    issued: "Jun 24, 2025", due: "Jul 24, 2025", ageDays: 1,
    lineItems: [{ description: "Rebrand — kickoff deposit", amount: 15000 }],
  }),
  inv({
    id: "inv-orch-1", number: "INV-2024-010",
    clientId: "c-orchard", client: "Orchard",
    projectId: "p-orch-1", projectName: "Packaging",
    status: "PAID", currency: "USD",
    issued: "May 20, 2024", due: "Jun 19, 2024", paidDate: "Jun 05, 2024", ageDays: 75,
    lineItems: [{ description: "Packaging — structural", amount: 16000 }],
  }),
  inv({
    id: "inv-lumen-1", number: "INV-2024-013",
    clientId: "c-lumen", client: "Lumen",
    projectId: "p-lumen-1", projectName: "Web app",
    status: "OVERDUE", currency: "EUR",
    issued: "Jun 05, 2024", due: "Jul 05, 2024", ageDays: 59,
    lineItems: [{ description: "MVP build — milestone 2", amount: 12000 }],
  }),
  inv({
    id: "inv-lumen-2", number: "INV-2024-020",
    clientId: "c-lumen", client: "Lumen",
    projectId: "p-lumen-1", projectName: "Web app",
    status: "SENT", currency: "EUR",
    issued: "Jul 20, 2024", due: "Aug 19, 2024", ageDays: 14,
    lineItems: [{ description: "Beta — milestone 3", amount: 8000 }],
  }),
  inv({
    id: "inv-fable-1", number: "INV-2024-008",
    clientId: "c-fable", client: "Fable",
    projectId: "p-fable-1", projectName: "Motion reel",
    status: "PAID", currency: "USD",
    issued: "Jul 20, 2024", due: "Aug 19, 2024", paidDate: "Aug 01, 2024", ageDays: 14,
    lineItems: [{ description: "Motion reel — storyboard", amount: 9000 }],
  }),
  inv({
    id: "inv-harbor-1", number: "INV-2023-021",
    clientId: "c-harbor", client: "Harbor & Co",
    projectId: "p-harbor-1", projectName: "Website",
    status: "PAID", currency: "USD",
    issued: "Dec 12, 2023", due: "Jan 11, 2024", paidDate: "Jan 03, 2024", ageDays: 400,
    lineItems: [{ description: "Website — full", amount: 34000 }],
  }),
]

/** Empty studio — no invoices yet. Drives the empty state. */
export const EMPTY_INVOICES: Invoice[] = []

/** An invoice is "open" (contributes to outstanding) when awaiting payment. */
export function isOpen(i: Invoice): boolean {
  return i.status === "SENT" || i.status === "OVERDUE"
}

export function getInvoice(id: string): Invoice | undefined {
  return INVOICES.find((i) => i.id === id)
}

export function invoicesForProject(projectId: string): Invoice[] {
  return INVOICES.filter((i) => i.projectId === projectId)
}

export function invoicesForClient(clientId: string): Invoice[] {
  return INVOICES.filter((i) => i.clientId === clientId)
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
}

export const INVOICE_STATUS_VARIANT: Record<
  InvoiceStatus,
  "secondary" | "info" | "success" | "destructive"
> = {
  DRAFT: "secondary",
  SENT: "info",
  PAID: "success",
  OVERDUE: "destructive",
}

/** Headline totals, converted into `display` currency. */
export function invoiceTotals(data: Invoice[], display: string) {
  const sum = (pred: (i: Invoice) => boolean) =>
    data
      .filter(pred)
      .reduce((s, i) => s + convert(i.amount, i.currency, display), 0)
  return {
    outstanding: sum(isOpen),
    overdue: sum((i) => i.status === "OVERDUE"),
    paid: sum((i) => i.status === "PAID"),
    draftCount: data.filter((i) => i.status === "DRAFT").length,
  }
}

/** Full formatted amount (no abbreviation), e.g. "$12,000". */
export function formatFull(amount: number, code: string): string {
  const symbol = getCurrency(code)?.symbol ?? ""
  return `${symbol}${amount.toLocaleString("en-US")}`
}

/** Re-export the compact formatter for convenience. */
export { formatMoney }
