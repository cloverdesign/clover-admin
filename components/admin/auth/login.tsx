"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { AuthShell } from "@/components/admin/auth/auth-shell"
import { useLogin, useVerifyOtp } from "@/lib/queries/auth-queries"

/**
 * Admin sign-in, two steps. Step 1: email + password → the API validates and
 * emails a 6-digit code. Step 2: enter the code → verify-otp mints the JWT and
 * we land on the dashboard (the guard then gates on approval/verification).
 */
export function Login() {
  const router = useRouter()
  const login = useLogin()
  const verify = useVerifyOtp()

  const [step, setStep] = React.useState<"credentials" | "otp">("credentials")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [otp, setOtp] = React.useState("")

  const credsValid = /.+@.+\..+/.test(email) && password.length > 0

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!credsValid) return
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          setOtp("")
          setStep("otp")
        },
      }
    )
  }

  const submitOtp = (value: string) => {
    verify.mutate(
      { email: email.trim(), otp: value },
      { onSuccess: () => router.push("/admin") }
    )
  }

  if (step === "otp") {
    return (
      <AuthShell title="Enter your code" subtitle={`We sent a 6-digit code to ${email}`}>
        <div className="flex flex-col items-center gap-5">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            onComplete={submitOtp}
            autoFocus
            disabled={verify.isPending}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} className="size-11 text-base" />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <Button
            className="w-full"
            disabled={otp.length !== 6 || verify.isPending}
            onClick={() => submitOtp(otp)}
          >
            {verify.isPending ? "Verifying…" : "Verify & sign in"}
          </Button>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button
              type="button"
              className="underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => setStep("credentials")}
            >
              Back
            </button>
            <span aria-hidden>·</span>
            <button
              type="button"
              className="underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
              onClick={() => sendCode()}
              disabled={login.isPending}
            >
              {login.isPending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Sign in to Clover" subtitle="Admin panel — internal access">
      <form className="flex flex-col gap-4" onSubmit={sendCode}>
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
          disabled={!credsValid || login.isPending}
        >
          {login.isPending ? "Sending code…" : "Continue"}
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
