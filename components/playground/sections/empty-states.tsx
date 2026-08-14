"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  Add01Icon,
  Invoice01Icon,
  Image01Icon,
  Task01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { SpecimenGroup } from "@/components/playground/section"

/**
 * Every placement the one EmptyState primitive serves. Two variants —
 * `default` (prominent) and `subtle` (quiet) — with `size` and `bordered`
 * modifiers covering page-level, sub-tab, in-panel and standalone contexts.
 */
export function EmptyStatesSection() {
  return (
    <div className="flex flex-col gap-8">
      {/* default, page-level — the first-run screen */}
      <SpecimenGroup label="Default · page-level first-run">
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={UserGroupIcon}
            title="No clients yet"
            description="Onboard your first client to start tracking their projects, invoices and deliverables. Their contact email becomes their portal sign-in."
            action={
              <Button className="gap-1.5">
                <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
                New client
              </Button>
            }
          />
        </div>
      </SpecimenGroup>

      {/* default + children — extended with a preview of what fills the space */}
      <SpecimenGroup label="Default · with preview (children)">
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={UserGroupIcon}
            title="Onboard your first client"
            description="Add a client to start tracking projects, milestones, invoices and deliverables. Your dashboard fills in as work comes through."
            action={
              <Button className="gap-1.5">
                <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
                New client
              </Button>
            }
          >
            <div className="mt-2 flex w-full flex-col gap-2 border-t border-border pt-6 text-left">
              <div className="px-1 font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
                What you’ll see here
              </div>
              {["Projects & milestones", "Invoices & payments", "Deliverables & reviews"].map(
                (label) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground"
                  >
                    <HugeiconsIcon icon={Invoice01Icon} className="size-4.5 shrink-0" />
                    {label}
                  </div>
                )
              )}
            </div>
          </EmptyState>
        </div>
      </SpecimenGroup>

      {/* default, size sm + bordered — the sub-tab state */}
      <SpecimenGroup label="Default · compact (size=sm, bordered) — sub-tabs">
        <EmptyState
          size="sm"
          bordered
          icon={Invoice01Icon}
          title="No invoices yet"
          description="Invoices raised against this project will show up here."
          action={
            <Button size="sm" variant="outline" className="gap-1.5">
              <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-3.5" />
              New invoice
            </Button>
          }
        />
      </SpecimenGroup>

      {/* dashboard cards — the empty states inside real PanelCard frames */}
      <SpecimenGroup label="Dashboard cards">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PanelCard icon={Task01Icon} title="Needs attention" bodyClassName="p-0">
            <EmptyState
              size="sm"
              icon={CheckmarkCircle02Icon}
              title="All caught up"
              description="Nothing needs your attention right now."
            />
          </PanelCard>
          <PanelCard icon={Clock01Icon} title="Upcoming milestones" bodyClassName="p-0">
            <EmptyState
              size="sm"
              icon={Clock01Icon}
              title="No upcoming milestones"
              description="Milestones with a due date show up here."
            />
          </PanelCard>
        </div>
      </SpecimenGroup>

      {/* default sm, in-panel — icon-led empty state inside a framed card */}
      <SpecimenGroup label="Default · compact, in-panel (borderless)">
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-4 py-3 text-sm font-medium">Invoices</div>
          <EmptyState
            size="sm"
            icon={Invoice01Icon}
            title="No invoices"
            description="No invoices match this filter yet."
          />
        </div>
      </SpecimenGroup>

      {/* subtle — the quietest treatment, plain muted line */}
      <SpecimenGroup label="Subtle · text-only">
        <EmptyState variant="subtle" bordered title="No milestones yet — add the first below." />
      </SpecimenGroup>

      {/* subtle, bordered — stands alone in the flow */}
      <SpecimenGroup label="Subtle · bordered — standalone">
        <div className="flex flex-col gap-3">
          <EmptyState variant="subtle" bordered title="No clients in this filter." />
          <EmptyState
            variant="subtle"
            bordered
            icon={Image01Icon}
            title="No media yet."
            action={
              <Button size="sm" variant="outline">
                Upload your first asset
              </Button>
            }
          />
        </div>
      </SpecimenGroup>
    </div>
  )
}
