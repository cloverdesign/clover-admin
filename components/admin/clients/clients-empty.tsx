import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon, Add01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

/** First-run Clients — no clients onboarded yet. */
export function ClientsEmpty() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center sm:py-24">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <HugeiconsIcon icon={UserGroupIcon} className="size-7" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">No clients yet</h2>
        <p className="text-sm text-muted-foreground">
          Onboard your first client to start tracking their projects, invoices
          and deliverables. Their contact email becomes their portal sign-in.
        </p>
      </div>
      <Button render={<Link href="/admin/clients/new" />} className="gap-1.5">
        <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
        New client
      </Button>
    </div>
  )
}
