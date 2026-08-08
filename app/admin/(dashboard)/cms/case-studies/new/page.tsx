import type { Metadata } from "next"

import { CaseStudyEditor } from "@/components/admin/cms/case-studies/case-study-editor"

export const metadata: Metadata = {
  title: "New case study — Site CMS",
}

export default function NewCaseStudyPage() {
  return <CaseStudyEditor />
}
