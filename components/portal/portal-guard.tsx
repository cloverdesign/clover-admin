"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { getPortalToken } from "@/lib/api/portal-auth-storage"
import { usePortalMe } from "@/lib/queries/portal-queries"

/**
 * Client-side route protection for the portal. Same shape as the admin guard but
 * against the portal session:
 *   - no token           → redirect to /portal/login
 *   - token, validating  → spinner (usePortalMe against /api/portal/me)
 *   - token invalid/401  → the portal axios client clears it; we redirect
 *   - token valid        → render the portal
 */
export function PortalGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hasToken, setHasToken] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (!getPortalToken()) {
      router.replace("/portal/login")
      setHasToken(false)
    } else {
      setHasToken(true)
    }
  }, [router])

  const me = usePortalMe()

  React.useEffect(() => {
    if (hasToken && me.isError && !getPortalToken()) {
      router.replace("/portal/login")
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
