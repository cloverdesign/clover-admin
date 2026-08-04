import type { Metadata } from "next"

import { getRevision, revisionTitle } from "@/lib/mock/revisions"
import { RevisionDetail } from "@/components/admin/revisions/revision-detail"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const revision = getRevision(id)
  return {
    title: revision ? `${revisionTitle(revision)} — Clover Admin` : "Revision request — Clover Admin",
  }
}

export default async function RevisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <RevisionDetail id={id} />
}
