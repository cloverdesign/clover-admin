"use client"

import {
  invoicePdfFilename,
  type InvoicePdfData,
} from "@/lib/invoice-pdf-data"

/**
 * Build an invoice PDF in the browser and hand it to the user.
 *
 * The API exposes `Invoice.pdfUrl` but leaves it null — verified against a live
 * issued-and-drafted invoice on 2026-09-02 — so neither the admin nor the portal
 * had a working download. This generates one locally from the same data the
 * screen is already rendering.
 *
 * Callers should still prefer `invoice.pdfUrl` when the backend starts filling
 * it: a server-rendered document is the authoritative artefact, and a client
 * that regenerates its own copy can drift from what the studio believes it sent.
 *
 * Both `@react-pdf/renderer` and the document are imported on demand — the
 * renderer is over a megabyte, and nobody should pay for it on page load.
 */
export async function downloadInvoicePdf(data: InvoicePdfData): Promise<void> {
  const [{ pdf }, { InvoicePdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/invoices/invoice-pdf-document"),
  ])

  const blob = await pdf(<InvoicePdfDocument {...data} />).toBlob()
  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement("a")
    link.href = url
    link.download = invoicePdfFilename(data.invoice.invoiceNumber)
    link.rel = "noreferrer"
    document.body.append(link)
    link.click()
    link.remove()
  } finally {
    // Safari needs the URL alive until the click is processed.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
}
