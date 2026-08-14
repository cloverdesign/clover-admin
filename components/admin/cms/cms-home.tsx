"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LinkSquare02Icon,
  File01Icon,
  Image01Icon,
  ArrowRight01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"

import { formatDate, byNewest } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { usePages, useMedia } from "@/lib/queries/cms-queries"
import { PageStatusBadge } from "@/components/admin/cms/parts"

const SITE_URL = "https://cloverdesign.xyz"

/**
 * Site CMS home — the hub for the public marketing site. Two content sections
 * (Pages, Media) with live counts, plus a recently-edited pages feed. Publish is
 * now per-page (the API's `isPublished` flag), so there's no site-wide deploy
 * panel.
 */
export function CmsHome() {
  const { data: pages } = usePages()
  const { data: media } = useMedia()

  const pageCount = pages?.length ?? 0
  const draftCount = pages?.filter((p) => !p.isPublished).length ?? 0
  const mediaCount = media?.length ?? 0

  const recent = [...(pages ?? [])]
    .sort((a, b) => byNewest(a.updatedAt, b.updatedAt))
    .slice(0, 6)

  const sections = [
    {
      key: "pages",
      label: "Pages",
      icon: File01Icon,
      href: "/admin/cms/pages",
      count: pageCount,
      hint: draftCount > 0 ? `${draftCount} draft${draftCount === 1 ? "" : "s"}` : "All published",
    },
    {
      key: "media",
      label: "Media",
      icon: Image01Icon,
      href: "/admin/cms/media",
      count: mediaCount,
      hint: "Image & file library",
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Site header */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">cloverdesign.xyz</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {pageCount} page{pageCount === 1 ? "" : "s"}
            {draftCount > 0 && ` · ${draftCount} in draft`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            className="gap-1.5"
            render={<a href={SITE_URL} target="_blank" rel="noreferrer" />}
          >
            <HugeiconsIcon icon={LinkSquare02Icon} data-icon="inline-start" className="size-4" />
            View site
          </Button>
          <Button className="gap-1.5" render={<Link href="/admin/cms/pages/new" />}>
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
            New page
          </Button>
        </div>
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.key}
            href={s.href}
            className="group flex items-start gap-4 rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-muted/30"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <HugeiconsIcon icon={s.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{s.label}</span>
                <span className="font-mono text-xs text-muted-foreground">{s.count}</span>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{s.hint}</p>
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="mt-1 size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground"
            />
          </Link>
        ))}
      </div>

      {/* Recently edited pages */}
      {recent.length > 0 && (
        <PanelCard icon={File01Icon} title="Recently edited">
          <div className="-mx-1 flex flex-col">
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/admin/cms/pages/${p.id}`}
                className="flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    /{p.slug} · Edited {formatDate(p.updatedAt)}
                  </div>
                </div>
                <PageStatusBadge isPublished={p.isPublished} />
              </Link>
            ))}
          </div>
        </PanelCard>
      )}
    </div>
  )
}
