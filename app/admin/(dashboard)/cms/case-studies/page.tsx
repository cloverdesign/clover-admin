import type { Metadata } from "next"

import { CaseStudiesList } from "@/components/admin/cms/case-studies/case-studies-list"

export const metadata: Metadata = {
  title: "Case studies — Site CMS",
}

export default function CmsCaseStudiesPage() {
  return <CaseStudiesList />
}
