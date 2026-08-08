import type { Metadata } from "next"

import { getCaseStudy } from "@/lib/mock/cms"
import { CaseStudyEditor } from "@/components/admin/cms/case-studies/case-study-editor"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const cs = getCaseStudy(id)
  return { title: cs ? `${cs.title} — Site CMS` : "Case study — Site CMS" }
}

export default async function CaseStudyEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CaseStudyEditor id={id} />
}
