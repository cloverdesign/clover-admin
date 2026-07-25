"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/admin/auth/auth-shell"
import { PendingApproval } from "@/components/admin/auth/pending-approval"

/** Register. Fields match POST /api/auth/register (name, email, password);
 * Confirm is client-side UX only. New accounts start unapproved, so submitting
 * shows the pending-approval notice. No API yet. */
export function Register() {
  const [pending, setPending] = React.useState(false)

  if (pending) return <PendingApproval />

  return (
    <AuthShell
      title="Create your account"
      subtitle="Clover admin — internal access"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          setPending(true)
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" type="text" placeholder="Tanya Ekekwe" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@clover.studio" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" placeholder="••••••••" />
        </div>

        <Button type="submit" className="mt-1 w-full">
          Create account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
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
