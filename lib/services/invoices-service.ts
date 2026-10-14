/**
 * Invoices transport — by-id + edit/delete + lifecycle actions (send, mark
 * paid, mark overdue). Creation and listing are project-scoped and live on
 * `ProjectsService` (the API exposes no global invoice list).
 */

import { apiClient } from "@/lib/api/client"
import { InvoiceEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type { Invoice, InvoiceInput } from "@/lib/api/models"

export class InvoicesService {
  /** Authenticated binary response, not the API's usual JSON envelope. */
  static async pdf(id: string, mode: "preview" | "download", signal?: AbortSignal): Promise<Blob> {
    const endpoint = mode === "preview" ? InvoiceEndpoints.previewPdf(id) : InvoiceEndpoints.downloadPdf(id)
    const res = await apiClient.get<Blob>(endpoint, {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
      signal,
    })
    if (!res.data.type.toLowerCase().startsWith("application/pdf")) {
      throw new Error("The server did not return a PDF.")
    }
    return res.data
  }

  static async getById(id: string): Promise<Invoice> {
    const res = await apiClient.get<ApiEnvelope<Invoice>>(InvoiceEndpoints.byId(id))
    return res.data.data
  }

  static async update(id: string, input: InvoiceInput): Promise<Invoice> {
    const res = await apiClient.put<ApiEnvelope<Invoice>>(
      InvoiceEndpoints.update(id),
      input
    )
    return res.data.data
  }

  static async remove(id: string): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(InvoiceEndpoints.remove(id))
  }

  static async send(id: string): Promise<Invoice> {
    const res = await apiClient.post<ApiEnvelope<Invoice>>(InvoiceEndpoints.send(id))
    return res.data.data
  }

  static async markPaid(id: string): Promise<Invoice> {
    const res = await apiClient.post<ApiEnvelope<Invoice>>(
      InvoiceEndpoints.markPaid(id)
    )
    return res.data.data
  }

  static async markOverdue(id: string): Promise<Invoice> {
    const res = await apiClient.post<ApiEnvelope<Invoice>>(
      InvoiceEndpoints.markOverdue(id)
    )
    return res.data.data
  }
}
