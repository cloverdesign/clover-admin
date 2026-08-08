"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { getToken } from "@/lib/api/auth-storage"
import { useMe } from "@/lib/queries/auth-queries"

/**
 * Client-side route protection for the admin app. Renders nothing but a spinner
 * until it knows the auth state:
 *   - no token           → redirect to /admin/login
 *   - token, validating  → spinner (useMe against /api/auth/me)
 *   - token invalid/401   → the axios interceptor clears it; we redirect to login
 *   - token valid        → render the app
 * Token lives in localStorage, so this check is client-only (no SSR gate).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [hasToken, setHasToken] = React.useState<boolean | null>(null)

  // Read the token after mount (localStorage is client-only).
  React.useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace("/admin/login")
      setHasToken(false)
    } else {
      setHasToken(true)
    }
  }, [router])

  // Validate the token; only runs once we know one exists.
  const me = useMe()

  React.useEffect(() => {
    // A 401 clears the token in the interceptor — bounce to login.
    if (hasToken && me.isError && !getToken()) {
      router.replace("/admin/login")
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
