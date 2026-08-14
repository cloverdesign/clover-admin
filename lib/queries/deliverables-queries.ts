/**
 * Deliverables hooks. Reads and mutations for the reference domain, wired to the
 * live Clover CMS API. Toast copy is declared via `meta` (the global cache
 * handlers fire it); invalidation is done here where the variables are in scope.
 *
 * Note: the admin API only exposes deliverables *per project* (no global list or
 * single-get), so these are all project-scoped. See `DeliverableEndpoints`.
 */

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { DeliverablesService } from "@/lib/services/deliverables-service"
import { useProjects } from "@/lib/queries/projects-queries"
import type { Deliverable, DeliverableInput } from "@/lib/api/models"

export function useProjectDeliverables(projectId: string) {
  return useQuery({
    queryKey: queryKeys.deliverables.byProject(projectId),
    queryFn: () => DeliverablesService.listByProject(projectId),
    enabled: Boolean(projectId),
    meta: { errorMessage: "Failed to load deliverables." },
  })
}

/**
 * All deliverables across the studio — composed by fanning out over projects
 * (the API has no global deliverables endpoint). One request per project.
 */
export function useAllDeliverables(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true
  const projectsQ = useProjects()
  const projects = projectsQ.data ?? []

  const results = useQueries({
    queries: projects.map((p) => ({
      queryKey: queryKeys.deliverables.byProject(p.id),
      queryFn: () => DeliverablesService.listByProject(p.id),
      enabled: enabled && projectsQ.isSuccess,
      meta: { silent: true as const },
    })),
  })

  return {
    deliverables: results.flatMap((r) => r.data ?? []) as Deliverable[],
    isLoading: projectsQ.isLoading || results.some((r) => r.isLoading),
    isError: projectsQ.isError || results.some((r) => r.isError),
    refetch: () => {
      projectsQ.refetch()
      results.forEach((r) => r.refetch())
    },
  }
}

/** A single deliverable, resolved from the composed set (no single-GET endpoint). */
export function useDeliverable(id: string) {
  const { deliverables, isLoading, isError, refetch } = useAllDeliverables()
  return {
    data: deliverables.find((d) => d.id === id),
    all: deliverables,
    isLoading,
    isError,
    refetch,
  }
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
