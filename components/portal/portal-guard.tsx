"use client"

import * as React from "react"

import { useHydrated } from "@/hooks/use-hydrated"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { getPortalToken } from "@/lib/api/portal-auth-storage"
import { usePortalMe } from "@/lib/queries/portal-queries"

/**
 * Client-side route protection for the portal. Same shape as the admin guard but
 * against the portal session:
 *   - no token           → redirect to /login
 *   - token, validating  → spinner (usePortalMe against /api/portal/me)
 *   - token invalid/401  → the portal axios client clears it; we redirect
 *   - token valid        → render the portal
 */
export function PortalGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  // The token lives in localStorage, so it can't be read during SSR or the
  // hydration pass — `null` means "not known yet", not "absent".
  const hydrated = useHydrated()
  const hasToken = hydrated ? Boolean(getPortalToken()) : null

  React.useEffect(() => {
    if (hydrated && !getPortalToken()) router.replace("/login")
  }, [hydrated, router])

  const me = usePortalMe()

  React.useEffect(() => {
    if (hasToken && me.isError && !getPortalToken()) {
      router.replace("/login")
    }
  }, [hasToken, me.isError, router])

  if (hasToken !== true || me.isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
