"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/admin/auth/auth-shell"

/** Forgot-password: email → "sent" confirmation. Dummy (no API) — submitting
 * just flips to the sent state. Worded to avoid email enumeration. */
export function ForgotPassword() {
  const [sent, setSent] = React.useState(false)

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="If an account exists for that address, a reset link is on its way."
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-chart-3/15 text-chart-3">
            <HugeiconsIcon icon={Mail01Icon} className="size-5" />
          </div>
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/admin/login" />}
          >
            Back to sign in
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we’ll send a reset link."
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@clover.studio" />
        </div>
        <Button type="submit" className="mt-1 w-full">
          Send reset link
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link
            href="/admin/login"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
