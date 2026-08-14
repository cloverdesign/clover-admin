"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  File01Icon,
  ArrowRight01Icon,
  Add01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { usePages } from "@/lib/queries/cms-queries"
import { PageStatusBadge } from "@/components/admin/cms/parts"

/**
 * Pages collection — every marketing-site page from the API. Each row opens the
 * block editor; "New page" scaffolds one. Publish state is the API's
 * `isPublished` flag.
 */
export function PagesList() {
  const { data: pages, isLoading, isError } = usePages()

  const action = (
    <Button size="sm" className="gap-1.5" render={<Link href="/admin/cms/pages/new" />}>
      <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-3.5" />
      New page
    </Button>
  )

  return (
    <PanelCard icon={File01Icon} title="Pages" action={action} className="min-h-0">
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Couldn’t load pages.
        </p>
      ) : !pages || pages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">No pages yet.</p>
          <Button size="sm" variant="outline" render={<Link href="/admin/cms/pages/new" />}>
            Create your first page
          </Button>
        </div>
      ) : (
        <div className="-mx-1 flex flex-col divide-y divide-border">
          {pages.map((p) => (
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
                  <span className="font-mono text-xs text-muted-foreground">
                    /{p.slug}
                  </span>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {p.blocks.length} block{p.blocks.length === 1 ? "" : "s"} · Edited{" "}
                  {formatDate(p.updatedAt)}
                </div>
              </div>
              <PageStatusBadge isPublished={p.isPublished} />
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground"
              />
            </Link>
          ))}
        </div>
      )}
    </PanelCard>
  )
}
