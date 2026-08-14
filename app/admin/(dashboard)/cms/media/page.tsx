import type { Metadata } from "next"

import { MediaLibrary } from "@/components/admin/cms/media/media-library"

export const metadata: Metadata = {
  title: "Media — Site CMS",
}

export default function CmsMediaPage() {
  return <MediaLibrary />
}
