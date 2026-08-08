import type { Metadata } from "next"

import { PagesList } from "@/components/admin/cms/pages/pages-list"

export const metadata: Metadata = {
  title: "Pages — Site CMS",
}

export default function CmsPagesPage() {
  return <PagesList />
}
