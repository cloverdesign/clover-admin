/**
 * Client-portal session token storage — kept separate from the admin token
 * (`clover.admin.token`) so an admin and a client can be signed in independently
 * in the same browser. The token is a 30-day bearer from `verify-otp`, injected
 * by the portal axios client. Guarded for SSR (no `window`).
 */

const PORTAL_TOKEN_KEY = "clover.portal.token"

export function getPortalToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(PORTAL_TOKEN_KEY)
}

export function setPortalToken(token: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PORTAL_TOKEN_KEY, token)
}

export function clearPortalToken(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(PORTAL_TOKEN_KEY)
}
