import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"

import { AuthShell } from "@/components/admin/auth/auth-shell"

/** A centered auth-flow notice (verify email, awaiting approval, check inbox) —
 * an icon in a soft disc, copy, and an optional action. Built on AuthShell. */
export function AuthNotice({
  icon,
  title,
  subtitle,
  body,
  action,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  title: string
  subtitle?: string
  body?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <AuthShell title={title} subtitle={subtitle}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <HugeiconsIcon icon={icon} className="size-5" />
        </div>
        {body && <div className="text-center text-sm text-muted-foreground">{body}</div>}
        {action}
      </div>
    </AuthShell>
  )
}
