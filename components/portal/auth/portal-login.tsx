"use client"

import * as React from "react"
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
import { useRequestOtp, useVerifyOtp } from "@/lib/queries/portal-queries"

/**
 * Passwordless portal login. Step 1: enter the email the studio registered →
 * request a one-time code. Step 2: enter the 6-digit code → verify for a 30-day
 * session, then land on the client home. Errors surface via the global toast.
 */
export function PortalLogin() {
  const router = useRouter()
  const requestOtp = useRequestOtp()
  const verifyOtp = useVerifyOtp()

  const [step, setStep] = React.useState<"email" | "code">("email")
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")

  const emailValid = /.+@.+\..+/.test(email)

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!emailValid) return
    requestOtp.mutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          setCode("")
          setStep("code")
        },
      }
    )
  }

  const verify = (value: string) => {
    verifyOtp.mutate(
      { email: email.trim(), code: value },
      { onSuccess: () => router.push("/portal") }
    )
  }

  if (step === "email") {
    return (
      <AuthShell
        title="Your project portal"
        subtitle="Enter your email and we’ll send you a sign-in code"
      >
        <form className="flex flex-col gap-4" onSubmit={sendCode}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="mt-1 w-full"
            disabled={!emailValid || requestOtp.isPending}
          >
            {requestOtp.isPending ? "Sending…" : "Send code"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Access is tied to the email your studio has on file.
          </p>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Enter your code"
      subtitle={`We sent a 6-digit code to ${email}`}
    >
      <div className="flex flex-col items-center gap-5">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          onComplete={verify}
          autoFocus
          disabled={verifyOtp.isPending}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} className="size-11 text-base" />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <Button
          className="w-full"
          disabled={code.length !== 6 || verifyOtp.isPending}
          onClick={() => verify(code)}
        >
          {verifyOtp.isPending ? "Verifying…" : "Verify & continue"}
        </Button>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <button
            type="button"
            className="underline-offset-4 hover:text-foreground hover:underline"
            onClick={() => setStep("email")}
          >
            Change email
          </button>
          <span aria-hidden>·</span>
          <button
            type="button"
            className="underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
            onClick={() => sendCode()}
            disabled={requestOtp.isPending}
          >
            {requestOtp.isPending ? "Sending…" : "Resend code"}
          </button>
        </div>
      </div>
    </AuthShell>
  )
}
