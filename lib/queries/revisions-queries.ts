/**
 * Revision-request hooks — queue list/detail plus the admin decisions: update
 * status, and approve (scaffold as a new phase or a new linked project). Approve
 * can spawn a project, so it also invalidates the projects list.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { RevisionsService } from "@/lib/services/revisions-service"
import type { RevisionStatusInput, RevisionApproveInput } from "@/lib/api/models"

export function useRevisions() {
  return useQuery({
    queryKey: queryKeys.revisions.all,
    queryFn: () => RevisionsService.list(),
    meta: { errorMessage: "Failed to load revision requests." },
  })
}

export function useRevision(id: string) {
  return useQuery({
    queryKey: queryKeys.revisions.byId(id),
    queryFn: () => RevisionsService.getById(id),
    enabled: Boolean(id),
    meta: { errorMessage: "Failed to load revision request." },
  })
}

export function useUpdateRevisionStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; input: RevisionStatusInput }) =>
      RevisionsService.updateStatus(vars.id, vars.input),
    meta: { successMessage: "Status updated.", errorMessage: "Failed to update status." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.revisions.byId(vars.id) })
      qc.invalidateQueries({ queryKey: queryKeys.revisions.all })
    },
  })
}

export function useApproveRevision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; input: RevisionApproveInput }) =>
      RevisionsService.approve(vars.id, vars.input),
    meta: {
      successMessage: "Revision approved.",
      errorMessage: "Failed to approve revision.",
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.revisions.byId(vars.id) })
      qc.invalidateQueries({ queryKey: queryKeys.revisions.all })
      // Approval may scaffold a new phase/project.
      qc.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}
