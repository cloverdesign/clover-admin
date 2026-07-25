import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { AuthShell } from "@/components/admin/auth/auth-shell"

/** Shown when an admin account exists but hasn't been approved yet — after
 * register, and on login attempts for an unapproved account. */
export function PendingApproval() {
  return (
    <AuthShell
      title="Awaiting approval"
      subtitle="Your account needs an admin to approve it before you can sign in."
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <HugeiconsIcon icon={Clock01Icon} className="size-5" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          We’ll email you as soon as your account is approved — it usually
          doesn’t take long.
        </p>
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
