import type { Metadata } from "next"
import { Suspense } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { VerifyEmail } from "@/components/admin/auth/verify-email"

export const metadata: Metadata = {
  title: "Verify email — Clover Admin",
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
          <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
        </div>
      }
    >
      <VerifyEmail />
    </Suspense>
  )
}
