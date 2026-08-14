"use client"

import * as React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ImageUploadIcon,
  Delete02Icon,
  Loading03Icon,
  LinkSquare02Icon,
} from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { useMedia, useUploadMedia, useDeleteMedia } from "@/lib/queries/cms-queries"
import { MEDIA_TYPE_ICON, formatBytes } from "@/components/admin/cms/parts"
import type { MediaAsset } from "@/lib/api/models"

/**
 * Media library — the shared asset pool (images, video, documents) from the API.
 * Upload posts multipart form data; delete removes the asset. Image assets show
 * a thumbnail; other types show a type glyph.
 */
export function MediaLibrary() {
  const { data: media, isLoading, isError } = useMedia()
  const upload = useUploadMedia()
  const del = useDeleteMedia()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [toDelete, setToDelete] = React.useState<MediaAsset | null>(null)

  const onFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => upload.mutate(file))
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {media ? `${media.length} asset${media.length === 1 ? "" : "s"}` : " "}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <Button
          size="sm"
          className="gap-1.5"
          disabled={upload.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <HugeiconsIcon
            icon={upload.isPending ? Loading03Icon : ImageUploadIcon}
            data-icon="inline-start"
            className={upload.isPending ? "size-3.5 animate-spin" : "size-3.5"}
          />
          {upload.isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
        </div>
      ) : isError ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Couldn’t load the media library.
        </p>
      ) : !media || media.length === 0 ? (
        <EmptyState
          variant="subtle"
          bordered
          title="No media yet."
          action={
            <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
              Upload your first asset
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <div
              key={m.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-foreground/20"
            >
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="relative flex aspect-[4/3] items-center justify-center bg-muted"
              >
                {m.type === "IMAGE" ? (
                  <Image
                    src={m.url}
                    alt={m.originalName}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <HugeiconsIcon
                    icon={MEDIA_TYPE_ICON[m.type]}
                    className="size-8 text-muted-foreground"
                  />
                )}
                <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md bg-black/40 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
                </span>
              </a>
              <div className="flex items-start gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-xs font-medium">{m.originalName}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {formatBytes(m.size)} · {formatDate(m.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Delete ${m.originalName}`}
                  onClick={() => setToDelete(m)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this asset?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.originalName} will be removed. Pages using it will lose the
              reference. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (toDelete) del.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
