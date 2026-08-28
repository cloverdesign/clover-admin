"use client"

import * as React from "react"

import { useHydrated } from "@/hooks/use-hydrated"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  Clock01Icon,
  MailValidation01Icon,
} from "@hugeicons/core-free-icons"

import { getToken, clearToken } from "@/lib/api/auth-storage"
import { useMe } from "@/lib/queries/auth-queries"
import { Button } from "@/components/ui/button"
import { AuthNotice } from "@/components/admin/auth/auth-notice"

/**
 * Client-side route protection for the admin app. Beyond "has a token", it gates
 * on the account state the API enforces:
 *   - no token / auth error → clear token, redirect to /admin/login
 *   - validating            → spinner (useMe against /api/auth/me)
 *   - email not verified    → "verify your email" notice (can't sign in yet)
 *   - not approved          → "awaiting approval" notice (every resource 403s)
 *   - verified + approved   → render the app
 * Without the approval/verification gates an unapproved admin would land on the
 * dashboard where every call returns "access denied".
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  // The token lives in localStorage, so it can't be read during SSR or the
  // hydration pass — `null` means "not known yet", not "absent".
  const hydrated = useHydrated()
  const hasToken = hydrated ? Boolean(getToken()) : null

  React.useEffect(() => {
    if (hydrated && !getToken()) router.replace("/admin/login")
  }, [hydrated, router])

  const me = useMe()

  // Any auth failure (expired / invalid / insufficient token) — drop it and
  // bounce, rather than stranding the user in a shell where everything 401/403s.
  React.useEffect(() => {
    if (hasToken && me.isError) {
      clearToken()
      router.replace("/admin/login")
    }
  }, [hasToken, me.isError, router])

  const signOut = () => {
    clearToken()
    router.replace("/admin/login")
  }

  if (hasToken !== true || me.isLoading || me.isError || !me.data) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }

  const admin = me.data

  if (!admin.emailVerified) {
    return (
      <AuthNotice
        icon={MailValidation01Icon}
        title="Verify your email"
        subtitle="Check your inbox for the verification link to finish setting up your account."
        body="Once your email is verified, sign in again."
        action={
          <Button variant="outline" className="w-full" onClick={signOut}>
            Back to sign in
          </Button>
        }
      />
    )
  }

  if (!admin.approved) {
    return (
      <AuthNotice
        icon={Clock01Icon}
        title="Awaiting approval"
        subtitle="Your account needs an admin to approve it before you can use the dashboard."
        body="We’ll email you as soon as it’s approved — it usually doesn’t take long."
        action={
          <Button variant="outline" className="w-full" onClick={signOut}>
            Sign out
          </Button>
        }
      />
    )
  }

  return <>{children}</>
}
