import type { Metadata } from "next"

import { PageEditor } from "@/components/admin/cms/pages/page-editor"

export const metadata: Metadata = {
  title: "Edit page — Site CMS",
}

export default async function CmsPageEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PageEditor id={id} />
}
