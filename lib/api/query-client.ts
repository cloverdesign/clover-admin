/**
 * QueryClient factory + centralized query-key registry.
 *
 * Next App Router twist over ocare's Vite setup: the client must NOT be a module
 * singleton, or SSR would leak cache across requests. `getQueryClient()` returns
 * a fresh instance on the server and a browser singleton on the client (the
 * pattern from the TanStack Query Next.js guide).
 *
 * Global QueryCache/MutationCache handlers own the toasts (sonner), reading the
 * typed `meta` bag. Cache invalidation is done per-hook via `useQueryClient()`
 * where the mutation variables are in scope — cleaner and correctly typed for v5.
 */

import {
  QueryClient,
  QueryCache,
  MutationCache,
  isServer,
} from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/types"

function messageOf(error: unknown, fallback: string): string {
  return (error as ApiError)?.message ?? fallback
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
    },
    queryCache: new QueryCache({
      onSuccess: (_data, query) => {
        if (query.meta?.successMessage) toast.success(query.meta.successMessage)
      },
      onError: (error, query) => {
        if (query.meta?.silent) return
        toast.error(messageOf(error, query.meta?.errorMessage ?? "Something went wrong."))
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: (_data, _vars, _ctx, mutation) => {
        if (mutation.meta?.successMessage) toast.success(mutation.meta.successMessage)
      },
      onError: (error, _vars, _ctx, mutation) => {
        toast.error(messageOf(error, mutation.meta?.errorMessage ?? "Something went wrong."))
      },
    }),
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

/** Single source of truth for cache keys — keeps read hooks and mutation
 * invalidations from drifting apart. */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  clients: {
    all: ["clients"] as const,
    byId: (id: string) => ["clients", id] as const,
  },
  projects: {
    all: ["projects"] as const,
    byId: (id: string) => ["projects", id] as const,
    invoices: (id: string) => ["projects", id, "invoices"] as const,
  },
  invoices: {
    byId: (id: string) => ["invoices", id] as const,
  },
  deliverables: {
    byProject: (projectId: string) =>
      ["deliverables", "project", projectId] as const,
  },
  revisions: {
    all: ["revisions"] as const,
    byId: (id: string) => ["revisions", id] as const,
  },
  pages: {
    all: ["pages"] as const,
    byId: (id: string) => ["pages", id] as const,
  },
  media: {
    all: ["media"] as const,
  },
} as const
