"use client"

/**
 * Client-portal hooks. Passwordless OTP auth (request → verify → 30-day token),
 * client-scoped reads, plus deliverable reviews and revision requests. Toast copy
 * rides on `meta` (the global cache handlers fire it); these share the app-wide
 * QueryClient with the admin, but under a separate `portal` key namespace and a
 * separate session token.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import {
  PortalAuthService,
  PortalProjectsService,
  PortalDeliverablesService,
  PortalRevisionsService,
} from "@/lib/services/portal-service"
import {
  setPortalToken,
  clearPortalToken,
  getPortalToken,
} from "@/lib/api/portal-auth-storage"
import type {
  PortalOtpRequestInput,
  PortalOtpVerifyInput,
  DeliverableReviewInput,
  PortalRevisionRequestInput,
  ClientProfileInput,
} from "@/lib/api/models"

/* -------------------------------------------------------------------- auth */

export function useRequestOtp() {
  return useMutation({
    mutationFn: (input: PortalOtpRequestInput) => PortalAuthService.requestOtp(input),
    meta: { errorMessage: "Couldn’t send a code. Please try again." },
  })
}

export function useVerifyOtp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PortalOtpVerifyInput) => PortalAuthService.verifyOtp(input),
    meta: {
      successMessage: "Signed in.",
      errorMessage: "That code didn’t work. Check it and try again.",
    },
    onSuccess: (session) => {
      setPortalToken(session.token)
      qc.setQueryData(queryKeys.portal.me, session.client)
    },
  })
}

export function usePortalLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => PortalAuthService.logout(),
    meta: { silent: true },
    // Clear locally regardless of the network result — the session is over.
    onSettled: () => {
      clearPortalToken()
      qc.clear()
    },
  })
}

export function usePortalMe() {
  return useQuery({
    queryKey: queryKeys.portal.me,
    queryFn: () => PortalAuthService.me(),
    enabled: Boolean(getPortalToken()),
    meta: { silent: true },
  })
}

export function useUpdatePortalProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ClientProfileInput) => PortalAuthService.updateMe(input),
    meta: { successMessage: "Profile updated.", errorMessage: "Couldn’t save your profile." },
    onSuccess: (client) => {
      qc.setQueryData(queryKeys.portal.me, client)
    },
  })
}

/* ---------------------------------------------------------------- projects */

export function usePortalProjects() {
  return useQuery({
    queryKey: queryKeys.portal.projects,
    queryFn: () => PortalProjectsService.list(),
    meta: { errorMessage: "Couldn’t load your projects." },
  })
}

export function usePortalProject(id: string) {
  return useQuery({
    queryKey: queryKeys.portal.project(id),
    queryFn: () => PortalProjectsService.getById(id),
    enabled: Boolean(id),
    meta: { errorMessage: "Couldn’t load this project." },
  })
}

/** Client-wide invoices — one request for the whole dashboard. The per-project
 * hook below still backs the project view. */
export function usePortalAllInvoices() {
  return useQuery({
    queryKey: queryKeys.portal.invoices,
    queryFn: () => PortalProjectsService.allInvoices(),
    meta: { errorMessage: "Couldn’t load invoices." },
  })
}

/** Client-wide deliverables — the counterpart to `usePortalAllInvoices`. */
export function usePortalAllDeliverables() {
  return useQuery({
    queryKey: queryKeys.portal.deliverables,
    queryFn: () => PortalProjectsService.allDeliverables(),
    meta: { errorMessage: "Couldn’t load deliverables." },
  })
}

export function usePortalProjectDeliverables(id: string) {
  return useQuery({
    queryKey: queryKeys.portal.projectDeliverables(id),
    queryFn: () => PortalProjectsService.deliverables(id),
    enabled: Boolean(id),
    meta: { errorMessage: "Couldn’t load deliverables." },
  })
}

export function usePortalProjectInvoices(id: string) {
  return useQuery({
    queryKey: queryKeys.portal.projectInvoices(id),
    queryFn: () => PortalProjectsService.invoices(id),
    enabled: Boolean(id),
    meta: { errorMessage: "Couldn’t load invoices." },
  })
}

export function usePortalRevisions() {
  return useQuery({
    queryKey: queryKeys.portal.revisions,
    queryFn: () => PortalRevisionsService.list(),
    meta: { errorMessage: "Couldn’t load your requests." },
  })
}

/* --------------------------------------------------------------- mutations */

export function useReviewDeliverable() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      deliverableId: string
      projectId: string
      input: DeliverableReviewInput
    }) => PortalDeliverablesService.review(vars.deliverableId, vars.input),
    meta: { successMessage: "Review submitted.", errorMessage: "Couldn’t submit your review." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: queryKeys.portal.projectDeliverables(vars.projectId),
      })
      qc.invalidateQueries({ queryKey: queryKeys.portal.revisions })
    },
  })
}

export function useSubmitRevision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { projectId: string; input: PortalRevisionRequestInput }) =>
      PortalProjectsService.submitRevision(vars.projectId, vars.input),
    meta: { successMessage: "Request sent.", errorMessage: "Couldn’t send your request." },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.portal.revisions })
    },
  })
}
