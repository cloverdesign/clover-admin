"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { File01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { PAGES } from "@/lib/mock/cms"
import { ContentStatusBadge } from "@/components/admin/cms/parts"

/**
 * Pages collection — the fixed marketing-site pages (Home, About, Services,
 * Contact). Pages aren't created or deleted here, only edited, so there's no
 * "New" action. Each row opens the page editor.
 */
export function PagesList() {
  return (
    <PanelCard icon={File01Icon} title="Pages" className="min-h-0">
      <div className="-mx-1 flex flex-col divide-y divide-border">
        {PAGES.map((p) => (
          <Link
            key={p.id}
            href={`/admin/cms/pages/${p.id}`}
            className="group flex items-center gap-4 px-1 py-3.5 transition-colors hover:bg-muted/40"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <HugeiconsIcon icon={File01Icon} className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{p.title}</span>
                <span className="font-mono text-xs text-muted-foreground">{p.path}</span>
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {p.blocks.length} block{p.blocks.length > 1 ? "s" : ""} · Edited{" "}
                {formatDate(p.updatedAt)}
              </div>
            </div>
            <ContentStatusBadge status={p.status} pendingChanges={p.pendingChanges} />
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground"
            />
          </Link>
        ))}
      </div>
    </PanelCard>
  )
}
