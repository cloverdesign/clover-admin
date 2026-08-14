/**
 * Shared API-layer types. The Clover CMS API wraps every response in a
 * `{ success, message, data }` envelope; services unwrap `.data`. Errors are
 * normalized to `ApiError` by the axios response interceptor.
 *
 * `AppMeta` types the React Query `meta` bag so hooks can declare toast copy
 * declaratively — the global QueryCache/MutationCache handlers read it.
 */

/** Standard success envelope returned by every endpoint. */
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

/** Normalized error shape (see `client.ts` response interceptor). */
export interface ApiError {
  message: string
  status: number
  code: string | number
}

/** Per-query / per-mutation metadata. Toast copy is picked up by the global
 * cache handlers; `silent` opts a query out of the global error toast. */
export type AppMeta = {
  successMessage?: string
  errorMessage?: string
  silent?: boolean
}

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: AppMeta
    mutationMeta: AppMeta
  }
}
