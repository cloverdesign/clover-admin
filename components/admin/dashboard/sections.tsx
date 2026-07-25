import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { FireIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AttentionItem, Milestone } from "@/lib/mock/dashboard"
import {
  KindIcon,
  StatusBadge,
  PhaseBadge,
} from "@/components/admin/dashboard/atoms"

function AttentionGroup({
  label,
  tone,
  marker,
  items,
}: {
  label: string
  tone: "destructive" | "secondary"
  marker?: React.ReactNode
  items: AttentionItem[]
}) {
  if (!items.length) return null
  return (
    <div>
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <Badge variant={tone} className="gap-1">
          {marker}
          {label}
        </Badge>
        <span className="text-xs text-muted-foreground/60">{items.length}</span>
      </div>
      <div className="flex flex-col divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <KindIcon kind={item.kind} className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{item.title}</div>
              <div className="truncate text-xs text-muted-foreground">
                {item.client} · {item.project} · {item.age} ago
              </div>
            </div>
            <StatusBadge status={item.status} />
            <Button variant="outline" size="sm" render={<Link href={item.href} />}>
              {item.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Needs-attention, grouped by urgency. Shared body used inside a PanelCard
 * (pass p-0). */
export function AttentionList({ items }: { items: AttentionItem[] }) {
  const high = items.filter((i) => i.urgency === "high")
  const later = items.filter((i) => i.urgency !== "high")
  return (
    <div className="flex flex-col pb-2">
      <AttentionGroup
        label="High priority"
        tone="destructive"
        marker={<HugeiconsIcon icon={FireIcon} className="size-3" />}
        items={high}
      />
      <AttentionGroup label="Later" tone="secondary" items={later} />
    </div>
  )
}

/** Upcoming milestones with a date chip. */
export function MilestonesList({ items }: { items: Milestone[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((m) => (
        <div key={m.id} className="flex items-center gap-3 px-5 py-3">
          <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-center leading-none">
            <span className="text-[10px] text-muted-foreground">
              {m.due.split(" ")[0]}
            </span>
            <span className="text-sm font-semibold">{m.due.split(" ")[1]}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{m.title}</div>
            <div className="truncate text-xs text-muted-foreground">
              {m.client}
            </div>
          </div>
          <PhaseBadge phase={m.phase} />
        </div>
      ))}
    </div>
  )
}

