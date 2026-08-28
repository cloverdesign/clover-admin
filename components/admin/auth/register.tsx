"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail01Icon } from "@hugeicons/core-free-icons"

import { AuthShell } from "@/components/admin/auth/auth-shell"
import { AuthNotice } from "@/components/admin/auth/auth-notice"
import { useRegister } from "@/lib/queries/auth-queries"

/** Register — POST /api/auth/register (name, email, password). New accounts must
 * verify their email before they can sign in, so a successful registration shows
 * a "check your inbox" notice. Confirm-password is client-side UX only. */
export function Register() {
  const register = useRegister()
  const [sent, setSent] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")

  if (sent) {
    return (
      <AuthNotice
        icon={Mail01Icon}
        title="Check your email"
        subtitle={`We sent a verification link to ${email}.`}
        body="Click the link to verify your account, then an admin will approve you."
        action={
          <Button variant="outline" className="w-full" render={<Link href="/admin/login" />}>
            Back to sign in
          </Button>
        }
      />
    )
  }

  const mismatch = confirm.length > 0 && confirm !== password
  const valid =
    name.trim().length > 0 &&
    /.+@.+\..+/.test(email) &&
    password.length >= 8 &&
    confirm === password

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate(
      { name, email, password },
      { onSuccess: () => setSent(true) }
    )
  }

  return (
    <AuthShell title="Create your account" subtitle="Clover admin — internal access">
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Tanya Ekekwe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@clover.studio"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={mismatch}
          />
          {mismatch && (
            <p className="text-xs text-destructive">Passwords don’t match.</p>
          )}
        </div>

        <Button
          type="submit"
          className="mt-1 w-full"
          disabled={!valid || register.isPending}
        >
          {register.isPending ? "Creating account…" : "Create account"}
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
