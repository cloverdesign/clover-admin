"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, Alert02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { AuthNotice } from "@/components/admin/auth/auth-notice"
import { useVerifyEmail } from "@/lib/queries/auth-queries"

/**
 * Email-verification landing — the target of the link in the verification email.
 * Reads `?token=`, exchanges it for a JWT (which signs the admin in), then heads
 * to the dashboard. The guard takes over from there (approval gate).
 */
export function VerifyEmail() {
  const router = useRouter()
  const token = useSearchParams().get("token")
  const verify = useVerifyEmail()
  const started = React.useRef(false)

  React.useEffect(() => {
    if (!token || started.current) return
    started.current = true
    verify.mutate({ token }, { onSuccess: () => router.replace("/admin") })
  }, [token, router, verify])

  if (!token || verify.isError) {
    return (
      <AuthNotice
        icon={Alert02Icon}
        title={token ? "Link expired" : "Invalid link"}
        subtitle={
          token
            ? "This verification link is invalid or has expired."
            : "This verification link is missing its token."
        }
        body="Try signing in to request a new one."
        action={
          <Button variant="outline" className="w-full" render={<Link href="/admin/login" />}>
            Back to sign in
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
      <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
    </div>
  )
}
