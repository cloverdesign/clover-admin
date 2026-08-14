/**
 * Admin auth token storage. The token is kept in localStorage and injected as a
 * Bearer header by the axios request interceptor. Guarded for SSR (no `window`).
 * Swap for httpOnly cookies once real session handling lands.
 */

const TOKEN_KEY = "clover.admin.token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_KEY)
}
