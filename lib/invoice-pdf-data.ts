import type { Invoice } from "@/lib/api/models"

/**
 * Everything the invoice PDF needs, assembled by the caller.
 *
 * The admin and the portal know different things about a client — the admin has
 * the full `Client` record, the portal only knows itself — so neither the
 * document nor this module fetches anything. They pass in what they have.
 */
export type InvoicePdfData = {
  invoice: Invoice
  billedTo: {
    company: string
    contact?: string | null
    email?: string | null
  }
  projectName?: string
  /** The studio issuing it. Defaults to "Clover". */
  issuer?: string
}

/**
 * Money for the PDF, as an ISO code and amount: "NGN 580,000.00".
 *
 * Not the symbol form used on screen. Two reasons: the PDF's built-in Helvetica
 * has no glyph for ₦ (and several other currency signs), which renders as a
 * blank or a box; and "$" is ambiguous across the US, Canadian and Australian
 * dollars the studio already bills in. A code is unambiguous on a document that
 * gets forwarded to someone else's accountant.
 *
 * Always two decimal places — an invoice states exact money, and the on-screen
 * abbreviations ("₦4.5M") have no place on one.
 */
export function formatPdfMoney(amount: number, currency: string): string {
  const value = Number.isFinite(amount) ? amount : 0
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(value)
      // Intl emits a non-breaking space after the code; a normal one measures
      // and wraps predictably in the PDF layout engine.
      .replace(/ /g, " ")
      .trim()
  } catch {
    // An unknown or malformed code throws rather than falling back.
    return `${currency} ${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
}

/** Download filename. The invoice number is studio-authored, so it's stripped
 * of anything that would be awkward in a filename before use. */
export function invoicePdfFilename(invoiceNumber: string): string {
  const safe = invoiceNumber
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `${safe || "invoice"}.pdf`
}
