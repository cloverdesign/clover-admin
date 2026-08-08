"use client"

import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ImageUploadIcon, Image01Icon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { MEDIA, formatBytes } from "@/lib/mock/cms"

/**
 * Media library — the shared image pool used across pages and case studies.
 * Assets are placeholder swatches (no real bytes in the mock); Upload is a dummy
 * that confirms with a toast.
 */
export function MediaLibrary() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {MEDIA.length} asset{MEDIA.length === 1 ? "" : "s"}
        </p>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => toast.success("Uploaded to media library")}
        >
          <HugeiconsIcon icon={ImageUploadIcon} data-icon="inline-start" className="size-3.5" />
          Upload
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {MEDIA.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => toast.success(`Opened ${m.name}`)}
            className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-colors hover:border-foreground/20"
          >
            <div
              className="relative flex aspect-[4/3] items-center justify-center"
              style={{ backgroundColor: m.color }}
            >
              <HugeiconsIcon icon={Image01Icon} className="size-6 text-white/40" />
              {m.usedOn.length === 0 && (
                <span className="absolute top-2 right-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                  Unused
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 p-3">
              <div className="truncate font-mono text-xs font-medium">{m.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {m.width}×{m.height} · {formatBytes(m.sizeBytes)}
              </div>
              <div className="mt-1 truncate text-[11px] text-muted-foreground">
                {m.usedOn.length > 0
                  ? `Used on ${m.usedOn.join(", ")}`
                  : `Added ${formatDate(m.uploadedAt)}`}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
