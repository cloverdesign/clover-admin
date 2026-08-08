"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthShell } from "@/components/admin/auth/auth-shell"
import { PendingApproval } from "@/components/admin/auth/pending-approval"
import { useLogin } from "@/lib/queries/auth-queries"
import { tokenFromLogin } from "@/lib/services/auth-service"

/** Login — POST /api/auth/login. On success with a token we land on the
 * dashboard; a tokenless success means the account isn't approved yet, so we
 * show the pending notice. Errors surface via the global toast handler. */
export function Login() {
  const router = useRouter()
  const login = useLogin()
  const [pending, setPending] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  if (pending) return <PendingApproval />

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate(
      { email, password },
      {
        onSuccess: (result) => {
          if (tokenFromLogin(result)) router.push("/admin")
          else setPending(true)
        },
      }
    )
  }

  const valid = /.+@.+\..+/.test(email) && password.length > 0

  return (
    <AuthShell title="Sign in to Clover" subtitle="Admin panel — internal access">
      <form className="flex flex-col gap-4" onSubmit={submit}>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/admin/forgot-password"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="mt-1 w-full"
          disabled={!valid || login.isPending}
        >
          {login.isPending ? "Signing in…" : "Sign in"}
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
