import type { Metadata } from "next"

import { RevisionsList } from "@/components/admin/revisions/revisions-list"

export const metadata: Metadata = {
  title: "Revision requests — Clover Admin",
}

export default function RevisionsPage() {
  return <RevisionsList />
}
