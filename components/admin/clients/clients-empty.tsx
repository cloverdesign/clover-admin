import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon, Add01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

/** First-run Clients — no clients onboarded yet. */
export function ClientsEmpty() {
  return (
    <EmptyState
      icon={UserGroupIcon}
      title="No clients yet"
      description="Onboard your first client to start tracking their projects, invoices and deliverables. Their contact email becomes their portal sign-in."
      action={
        <Button render={<Link href="/admin/clients/new" />} className="gap-1.5">
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
          New client
        </Button>
      }
    />
  )
}
