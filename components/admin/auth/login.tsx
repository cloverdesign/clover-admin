"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/admin/auth/auth-shell"
import { PendingApproval } from "@/components/admin/auth/pending-approval"

/** Login. No API yet — submitting shows the pending-approval notice (the
 * unapproved-account state). Real API will branch: approved → dashboard,
 * unapproved → this notice. */
export function Login() {
  const [pending, setPending] = React.useState(false)

  if (pending) return <PendingApproval />

  return (
    <AuthShell
      title="Sign in to Clover"
      subtitle="Admin panel — internal access"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          setPending(true)
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@clover.studio" />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/admin/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>

        <Button type="submit" className="mt-1 w-full">
          Sign in
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New to Clover?{" "}
          <Link
            href="/admin/register"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
