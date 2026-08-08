import type { Metadata } from "next"

import { CmsHome } from "@/components/admin/cms/cms-home"

export const metadata: Metadata = {
  title: "Site CMS — Clover Admin",
}

export default function CmsPage() {
  return <CmsHome />
}
