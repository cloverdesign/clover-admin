import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserAdd01Icon,
  Add01Icon,
  Folder01Icon,
  Invoice01Icon,
  DeliveryBox01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

const PREVIEW = [
  { icon: Folder01Icon, label: "Projects & milestones" },
  { icon: Invoice01Icon, label: "Invoices & payments" },
  { icon: DeliveryBox01Icon, label: "Deliverables & reviews" },
]

/** First-run dashboard — no clients onboarded yet. Each layout variant renders
 * this when the studio has no projects. */
export function DashboardEmpty() {
  return (
    <EmptyState
      icon={UserAdd01Icon}
      title="Onboard your first client"
      description="Add a client to start tracking projects, milestones, invoices and deliverables. Your dashboard fills in as work comes through."
      action={
        <Button render={<Link href="/admin/clients/new" />} className="gap-1.5">
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
          New client
        </Button>
      }
    >
      <div className="mt-2 flex w-full flex-col gap-2 border-t border-border pt-6 text-left">
        <div className="px-1 font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
          What you’ll see here
        </div>
        {PREVIEW.map((p) => (
          <div
            key={p.label}
            className="flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground"
          >
            <HugeiconsIcon icon={p.icon} className="size-4.5 shrink-0" />
            {p.label}
          </div>
        ))}
      </div>
    </EmptyState>
  )
}
