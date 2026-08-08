"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CASE_STUDIES } from "@/lib/mock/cms"
import { ContentStatusBadge } from "@/components/admin/cms/parts"

/**
 * Case studies collection — the studio's selected work. Unlike pages, entries
 * are created and deleted here, so the header carries a "New" action.
 */
export function CaseStudiesList() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {CASE_STUDIES.length} entr{CASE_STUDIES.length === 1 ? "y" : "ies"}
        </p>
        <Button size="sm" className="gap-1.5" render={<Link href="/admin/cms/case-studies/new" />}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-3.5" />
          New case study
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CASE_STUDIES.map((c) => (
          <Link
            key={c.id}
            href={`/admin/cms/case-studies/${c.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:border-foreground/20"
          >
            <div
              className="flex aspect-[16/7] items-end p-4"
              style={{ backgroundColor: c.coverColor }}
            >
              <div className="flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-black/30 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium">{c.title}</span>
                <ContentStatusBadge status={c.status} pendingChanges={c.pendingChanges} />
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{c.excerpt}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{c.client}</Badge>
                <span>Edited {formatDate(c.updatedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
