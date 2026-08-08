"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  LinkSquare02Icon,
  RocketIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { ContentStatusBadge } from "@/components/admin/cms/parts"
import { useCmsPublish } from "@/components/admin/cms/publish-context"
import type { ContentStatus } from "@/lib/mock/cms"

/**
 * Shared chrome for every CMS editor — a header with the title, live status,
 * an optional "view on site" link and the Draft / Publish actions, over a
 * centered form column. Publishing routes through the shared deploy simulation
 * (PRD §2.3), so saving a draft is instant but publishing kicks off a rebuild.
 */
export function EditorScaffold({
  title,
  status,
  pendingChanges,
  livePath,
  valid = true,
  onSaveDraft,
  onPublish,
  onDelete,
  children,
}: {
  title: string
  status: ContentStatus
  pendingChanges?: boolean
  /** Path on the live site, e.g. "/about" — shows a View link when published. */
  livePath?: string
  valid?: boolean
  onSaveDraft: () => void
  onPublish: () => void
  onDelete?: () => void
  children: React.ReactNode
}) {
  const { building } = useCmsPublish()

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <Link
            href="/admin/cms"
            aria-label="Back to CMS"
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
              <ContentStatusBadge status={status} pendingChanges={pendingChanges} />
            </div>
            {livePath && status === "PUBLISHED" && (
              <a
                href={`https://cloverdesign.xyz${livePath}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
                cloverdesign.xyz{livePath === "/" ? "" : livePath}
              </a>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete"
              onClick={onDelete}
              className="text-muted-foreground hover:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            </Button>
          )}
          <Button variant="outline" onClick={onSaveDraft} disabled={!valid}>
            Save draft
          </Button>
          <Button className="gap-1.5" onClick={onPublish} disabled={!valid || building}>
            <HugeiconsIcon icon={RocketIcon} data-icon="inline-start" className="size-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  )
}
