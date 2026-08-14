/**
 * Projects hooks — project list/detail reads, CRUD, and the nested collections
 * (milestones, updates, invoices). Milestone/update mutations invalidate the
 * parent project so the detail view refreshes.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { ProjectsService } from "@/lib/services/projects-service"
import type {
  Project,
  ProjectInput,
  ProjectUpdateInput,
  MilestoneInput,
  ProjectUpdatePostInput,
  InvoiceInput,
} from "@/lib/api/models"

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => ProjectsService.list(),
    meta: { errorMessage: "Failed to load projects." },
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.byId(id),
    queryFn: () => ProjectsService.getById(id),
    enabled: Boolean(id),
    meta: { errorMessage: "Failed to load project." },
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectInput) => ProjectsService.create(input),
    meta: { successMessage: "Project created.", errorMessage: "Failed to create project." },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; input: ProjectUpdateInput }) =>
      ProjectsService.update(vars.id, vars.input),
    meta: { successMessage: "Project updated.", errorMessage: "Failed to update project." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.byId(vars.id) })
      qc.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ProjectsService.remove(id),
    meta: { successMessage: "Project deleted.", errorMessage: "Failed to delete project." },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

/* --------------------------------------------------------------- milestones */

/**
 * Sync the project's durable `progress` field (e.g. from milestone completion).
 * Patches it into the cached project in place rather than invalidating — a
 * refetch would return a milestone-less project and wipe the in-session list.
 * Silent: it's an automatic side-effect, not a user-initiated save.
 */
export function useSyncProjectProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; progress: number }) =>
      ProjectsService.update(vars.id, { progress: vars.progress }),
    meta: { silent: true as const },
    onSuccess: (_data, vars) => {
      qc.setQueryData<Project>(queryKeys.projects.byId(vars.id), (old) =>
        old ? { ...old, progress: vars.progress } : old
      )
      qc.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

/**
 * Milestone mutations drive the cached project directly from their responses.
 * The project endpoint doesn't return milestones (and there's no list endpoint),
 * so invalidating/refetching would wipe the list — instead we merge the created/
 * updated/removed milestone into the cached project so the change is visible.
 */
export function useCreateMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { projectId: string; input: MilestoneInput }) =>
      ProjectsService.createMilestone(vars.projectId, vars.input),
    meta: { successMessage: "Milestone added.", errorMessage: "Failed to add milestone." },
    onSuccess: (created, vars) => {
      qc.setQueryData<Project>(queryKeys.projects.byId(vars.projectId), (old) =>
        old ? { ...old, milestones: [...(old.milestones ?? []), created] } : old
      )
    },
  })
}

export function useUpdateMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      projectId: string
      milestoneId: string
      input: MilestoneInput
    }) => ProjectsService.updateMilestone(vars.projectId, vars.milestoneId, vars.input),
    meta: { successMessage: "Milestone updated.", errorMessage: "Failed to update milestone." },
    onSuccess: (updated, vars) => {
      qc.setQueryData<Project>(queryKeys.projects.byId(vars.projectId), (old) =>
        old
          ? {
              ...old,
              milestones: (old.milestones ?? []).map((m) =>
                m.id === updated.id ? updated : m
              ),
            }
          : old
      )
    },
  })
}

export function useDeleteMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { projectId: string; milestoneId: string }) =>
      ProjectsService.removeMilestone(vars.projectId, vars.milestoneId),
    meta: { successMessage: "Milestone removed.", errorMessage: "Failed to remove milestone." },
    onSuccess: (_data, vars) => {
      qc.setQueryData<Project>(queryKeys.projects.byId(vars.projectId), (old) =>
        old
          ? {
              ...old,
              milestones: (old.milestones ?? []).filter((m) => m.id !== vars.milestoneId),
            }
          : old
      )
    },
  })
}

/* ---------------------------------------------------------- project updates */

export function useCreateProjectUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { projectId: string; input: ProjectUpdatePostInput }) =>
      ProjectsService.createUpdate(vars.projectId, vars.input),
    meta: { successMessage: "Update posted.", errorMessage: "Failed to post update." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.byId(vars.projectId) })
    },
  })
}

export function useDeleteProjectUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { projectId: string; updateId: string }) =>
      ProjectsService.removeUpdate(vars.projectId, vars.updateId),
    meta: { successMessage: "Update removed.", errorMessage: "Failed to remove update." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.byId(vars.projectId) })
    },
  })
}

/* ------------------------------------------------------------------ invoices */

export function useProjectInvoices(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.invoices(projectId),
    queryFn: () => ProjectsService.invoices(projectId),
    enabled: Boolean(projectId),
    meta: { errorMessage: "Failed to load invoices." },
  })
}

export function useCreateProjectInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { projectId: string; input: InvoiceInput }) =>
      ProjectsService.createInvoice(vars.projectId, vars.input),
    meta: { successMessage: "Invoice created.", errorMessage: "Failed to create invoice." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.invoices(vars.projectId) })
    },
  })
}
