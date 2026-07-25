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

const PREVIEW = [
  { icon: Folder01Icon, label: "Projects & milestones" },
  { icon: Invoice01Icon, label: "Invoices & payments" },
  { icon: DeliveryBox01Icon, label: "Deliverables & reviews" },
]

/** First-run dashboard — no clients onboarded yet. Each layout variant renders
 * this when the studio has no projects. */
export function DashboardEmpty() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center sm:py-24">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <HugeiconsIcon icon={UserAdd01Icon} className="size-7" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Onboard your first client
        </h2>
        <p className="text-sm text-muted-foreground">
          Add a client to start tracking projects, milestones, invoices and
          deliverables. Your dashboard fills in as work comes through.
        </p>
      </div>

      <Button render={<Link href="/admin/clients/new" />} className="gap-1.5">
        <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
        New client
      </Button>

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
    </div>
  )
}
