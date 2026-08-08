import type { Metadata } from "next"

import { getPage } from "@/lib/mock/cms"
import { PageEditor } from "@/components/admin/cms/pages/page-editor"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const page = getPage(id)
  return { title: page ? `${page.title} — Site CMS` : "Page — Site CMS" }
}

export default async function CmsPageEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PageEditor id={id} />
}
