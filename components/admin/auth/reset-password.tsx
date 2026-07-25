"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/admin/auth/auth-shell"

/** Reset-password: new password + confirm → success. Reads a ?token= from the
 * emailed link (display/context only). Dummy — no API. */
export function ResetPassword() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [done, setDone] = React.useState(false)

  if (done) {
    return (
      <AuthShell
        title="Password updated"
        subtitle="You can now sign in with your new password."
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-chart-3/15 text-chart-3">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5" />
          </div>
          <Button className="w-full" render={<Link href="/admin/login" />}>
            Back to sign in
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a new password for your admin account."
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          setDone(true)
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" placeholder="••••••••" />
        </div>
        <Button type="submit" className="mt-1 w-full" disabled={!token}>
          Reset password
        </Button>
        {!token && (
          <p className="text-center text-xs text-muted-foreground">
            This link is missing its reset token.
          </p>
        )}
      </form>
    </AuthShell>
  )
}
