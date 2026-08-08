/**
 * Deliverables hooks. Reads and mutations for the reference domain, wired to the
 * live Clover CMS API. Toast copy is declared via `meta` (the global cache
 * handlers fire it); invalidation is done here where the variables are in scope.
 *
 * Note: the admin API only exposes deliverables *per project* (no global list or
 * single-get), so these are all project-scoped. See `DeliverableEndpoints`.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { DeliverablesService } from "@/lib/services/deliverables-service"
import type { DeliverableInput } from "@/lib/api/models"

export function useProjectDeliverables(projectId: string) {
  return useQuery({
    queryKey: queryKeys.deliverables.byProject(projectId),
    queryFn: () => DeliverablesService.listByProject(projectId),
    enabled: Boolean(projectId),
    meta: { errorMessage: "Failed to load deliverables." },
  })
}

export function useCreateDeliverable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { projectId: string; input: DeliverableInput }) =>
      DeliverablesService.create(vars.projectId, vars.input),
    meta: {
      successMessage: "Deliverable added.",
      errorMessage: "Failed to add deliverable.",
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: queryKeys.deliverables.byProject(vars.projectId),
      })
    },
  })
}

export function useUpdateDeliverable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      id: string
      projectId: string
      input: DeliverableInput
    }) => DeliverablesService.update(vars.id, vars.input),
    meta: {
      successMessage: "Deliverable updated.",
      errorMessage: "Failed to update deliverable.",
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: queryKeys.deliverables.byProject(vars.projectId),
      })
    },
  })
}

export function useDeleteDeliverable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; projectId: string }) =>
      DeliverablesService.remove(vars.id),
    meta: {
      successMessage: "Deliverable deleted.",
      errorMessage: "Failed to delete deliverable.",
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: queryKeys.deliverables.byProject(vars.projectId),
      })
    },
  })
}
