import type { Metadata } from "next"

import { ProjectDetail } from "@/components/admin/projects/project-detail"

export const metadata: Metadata = {
  title: "Project — Clover Admin",
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProjectDetail id={id} />
}
