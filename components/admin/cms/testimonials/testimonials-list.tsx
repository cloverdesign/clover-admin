"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, QuoteUpIcon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { TESTIMONIALS } from "@/lib/mock/cms"
import { ContentStatusBadge } from "@/components/admin/cms/parts"

/** Testimonials collection — client quotes used across the marketing site. */
export function TestimonialsList() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {TESTIMONIALS.length} quote{TESTIMONIALS.length === 1 ? "" : "s"}
        </p>
        <Button size="sm" className="gap-1.5" render={<Link href="/admin/cms/testimonials/new" />}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-3.5" />
          New testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {TESTIMONIALS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/cms/testimonials/${t.id}`}
            className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-muted/20"
          >
            <div className="flex items-start justify-between gap-2">
              <HugeiconsIcon icon={QuoteUpIcon} className="size-5 text-muted-foreground/50" />
              <ContentStatusBadge status={t.status} pendingChanges={t.pendingChanges} />
            </div>
            <p className="line-clamp-3 text-sm text-foreground/90">“{t.quote}”</p>
            <div className="mt-auto flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">{t.author}</div>
                <div className="truncate text-muted-foreground">
                  {t.role}, {t.company}
                </div>
              </div>
              <span className="shrink-0 text-muted-foreground">{formatDate(t.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
