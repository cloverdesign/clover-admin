import type { Metadata } from "next"

import { NewPagePage } from "@/components/admin/cms/pages/new-page-page"

export const metadata: Metadata = {
  title: "New page — Site CMS",
}

export default function NewCmsPageRoute() {
  return <NewPagePage />
}
