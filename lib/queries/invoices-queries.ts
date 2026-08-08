/**
 * Invoices hooks — by-id read, edit/delete, and the lifecycle actions (send,
 * mark paid, mark overdue). Each mutation refreshes the invoice and its parent
 * project's invoice list (the returned invoice carries `projectId`).
 *
 * Listing/creation are project-scoped — see `useProjectInvoices` /
 * `useCreateProjectInvoice` in `projects-queries`.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { InvoicesService } from "@/lib/services/invoices-service"
import type { Invoice, InvoiceInput } from "@/lib/api/models"

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.invoices.byId(id),
    queryFn: () => InvoicesService.getById(id),
    enabled: Boolean(id),
    meta: { errorMessage: "Failed to load invoice." },
  })
}

/** Shared cache refresh for a mutated invoice + its project's list. */
function useInvoiceInvalidation() {
  const qc = useQueryClient()
  return (invoice: Invoice) => {
    qc.invalidateQueries({ queryKey: queryKeys.invoices.byId(invoice.id) })
    qc.invalidateQueries({ queryKey: queryKeys.projects.invoices(invoice.projectId) })
  }
}

export function useUpdateInvoice() {
  const invalidate = useInvoiceInvalidation()
  return useMutation({
    mutationFn: (vars: { id: string; input: InvoiceInput }) =>
      InvoicesService.update(vars.id, vars.input),
    meta: { successMessage: "Invoice updated.", errorMessage: "Failed to update invoice." },
    onSuccess: (invoice) => invalidate(invoice),
  })
}

export function useDeleteInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; projectId: string }) =>
      InvoicesService.remove(vars.id),
    meta: { successMessage: "Invoice deleted.", errorMessage: "Failed to delete invoice." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.invoices(vars.projectId) })
    },
  })
}

export function useSendInvoice() {
  const invalidate = useInvoiceInvalidation()
  return useMutation({
    mutationFn: (id: string) => InvoicesService.send(id),
    meta: { successMessage: "Invoice sent.", errorMessage: "Failed to send invoice." },
    onSuccess: (invoice) => invalidate(invoice),
  })
}

export function useMarkInvoicePaid() {
  const invalidate = useInvoiceInvalidation()
  return useMutation({
    mutationFn: (id: string) => InvoicesService.markPaid(id),
    meta: { successMessage: "Invoice marked paid.", errorMessage: "Failed to update invoice." },
    onSuccess: (invoice) => invalidate(invoice),
  })
}

export function useMarkInvoiceOverdue() {
  const invalidate = useInvoiceInvalidation()
  return useMutation({
    mutationFn: (id: string) => InvoicesService.markOverdue(id),
    meta: { successMessage: "Invoice marked overdue.", errorMessage: "Failed to update invoice." },
    onSuccess: (invoice) => invalidate(invoice),
  })
}
