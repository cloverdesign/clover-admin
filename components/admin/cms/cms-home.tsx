"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  RocketIcon,
  LinkSquare02Icon,
  File01Icon,
  News01Icon,
  QuoteUpIcon,
  Image01Icon,
  Settings01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { PanelCard } from "@/components/admin/dashboard/cards"
import {
  PAGES,
  CASE_STUDIES,
  TESTIMONIALS,
  MEDIA,
  recentChanges,
  CONTENT_KIND_LABEL,
  type ContentStatus,
} from "@/lib/mock/cms"
import { useCmsPublish } from "@/components/admin/cms/publish-context"
import { DeployPill, ContentStatusBadge } from "@/components/admin/cms/parts"

type Section = {
  key: string
  label: string
  icon: typeof File01Icon
  href: string
  count: number
  pending: number
  hint: string
}

function pendingOf(items: { status: ContentStatus; pendingChanges?: boolean }[]) {
  return items.filter((i) => i.status === "DRAFT" || i.pendingChanges).length
}

const SECTIONS: Section[] = [
  {
    key: "pages", label: "Pages", icon: File01Icon, href: "/admin/cms/pages",
    count: PAGES.length, pending: pendingOf(PAGES),
    hint: "Home, About, Services, Contact",
  },
  {
    key: "case-studies", label: "Case studies", icon: News01Icon, href: "/admin/cms/case-studies",
    count: CASE_STUDIES.length, pending: pendingOf(CASE_STUDIES),
    hint: "Portfolio and selected work",
  },
  {
    key: "testimonials", label: "Testimonials", icon: QuoteUpIcon, href: "/admin/cms/testimonials",
    count: TESTIMONIALS.length, pending: pendingOf(TESTIMONIALS),
    hint: "Client quotes",
  },
  {
    key: "media", label: "Media", icon: Image01Icon, href: "/admin/cms/media",
    count: MEDIA.length, pending: 0,
    hint: "Image library",
  },
  {
    key: "settings", label: "Settings", icon: Settings01Icon, href: "/admin/cms/settings",
    count: 0, pending: 0,
    hint: "Contact, socials, footer",
  },
]

/**
 * Site CMS home — the hub for the public marketing site (PRD Module 2). A site
 * status panel drives the Vercel deploy (Publish → rebuild), a grid of content
 * types routes into each collection, and a recent-changes feed shows what's
 * edited but not yet live.
 */
export function CmsHome() {
  const { status, unpublished, lastDeployAt, building, publish } = useCmsPublish()
  const recent = recentChanges()
  // After a full deploy the shared counter hits 0 — reflect that everywhere on
  // the hub, not just the status line (the mock arrays don't mutate).
  const allPublished = unpublished === 0

  return (
    <div className="flex flex-col gap-5">
      {/* Site status */}
      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold tracking-tight">cloverdesign.xyz</h2>
            <DeployPill status={status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {unpublished > 0
              ? `${unpublished} change${unpublished > 1 ? "s" : ""} not yet published`
              : "Everything is published"}
            {" · "}Last deploy {formatDate(lastDeployAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            className="gap-1.5"
            render={<a href="https://cloverdesign.xyz" target="_blank" rel="noreferrer" />}
          >
            <HugeiconsIcon icon={LinkSquare02Icon} data-icon="inline-start" className="size-4" />
            View site
          </Button>
          <Button
            className="gap-1.5"
            disabled={building || unpublished === 0}
            onClick={() => publish()}
          >
            <HugeiconsIcon icon={RocketIcon} data-icon="inline-start" className="size-4" />
            {building ? "Deploying…" : "Publish changes"}
          </Button>
        </div>
      </div>

      {/* Content types */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
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
                {s.count > 0 && (
                  <span className="font-mono text-xs text-muted-foreground">{s.count}</span>
                )}
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{s.hint}</p>
              {!allPublished && s.pending > 0 && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-warning/10 px-1.5 py-0.5 text-xs font-medium text-warning">
                  {s.pending} unpublished
                </span>
              )}
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="mt-1 size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground"
            />
          </Link>
        ))}
      </div>

      {/* Recent changes */}
      <PanelCard icon={File01Icon} title="Recent changes">
        <div className="-mx-1 flex flex-col">
          {recent.map((r) => (
            <Link
              key={r.id}
              href={r.href}
              className="flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">
                  {CONTENT_KIND_LABEL[r.kind]} · Edited {formatDate(r.updatedAt)}
                </div>
              </div>
              <ContentStatusBadge
                status={allPublished ? "PUBLISHED" : r.status}
                pendingChanges={allPublished ? false : r.pendingChanges}
              />
            </Link>
          ))}
        </div>
      </PanelCard>
    </div>
  )
}
