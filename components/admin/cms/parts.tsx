import {
  Image01Icon,
  PlayCircleIcon,
  File01Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import type { MediaType } from "@/lib/api/models"

/** Page publish state as a badge — the API is a simple published/draft flag. */
export function PageStatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <Badge variant={isPublished ? "success" : "warning"}>
      {isPublished ? "Published" : "Draft"}
    </Badge>
  )
}

/** Glyph for a media asset's type. */
export const MEDIA_TYPE_ICON: Record<MediaType, typeof Image01Icon> = {
  IMAGE: Image01Icon,
  VIDEO: PlayCircleIcon,
  DOCUMENT: File01Icon,
}

/** Human file size, e.g. "840 KB". */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "—"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, i)
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}
