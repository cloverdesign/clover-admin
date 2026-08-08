/** Clients hooks — list/detail reads + CRUD and portal-invite mutations. */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { ClientsService } from "@/lib/services/clients-service"
import type { ClientInput } from "@/lib/api/models"

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients.all,
    queryFn: () => ClientsService.list(),
    meta: { errorMessage: "Failed to load clients." },
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: queryKeys.clients.byId(id),
    queryFn: () => ClientsService.getById(id),
    enabled: Boolean(id),
    meta: { errorMessage: "Failed to load client." },
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ClientInput) => ClientsService.create(input),
    meta: { successMessage: "Client created.", errorMessage: "Failed to create client." },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all })
    },
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; input: ClientInput }) =>
      ClientsService.update(vars.id, vars.input),
    meta: { successMessage: "Client updated.", errorMessage: "Failed to update client." },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.byId(vars.id) })
      qc.invalidateQueries({ queryKey: queryKeys.clients.all })
    },
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ClientsService.remove(id),
    meta: { successMessage: "Client deleted.", errorMessage: "Failed to delete client." },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all })
    },
  })
}

export function useSendPortalInvite() {
  return useMutation({
    mutationFn: (id: string) => ClientsService.sendPortalInvite(id),
    meta: {
      successMessage: "Portal invite sent.",
      errorMessage: "Failed to send invite.",
    },
  })
}
