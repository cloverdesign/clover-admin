import type { Metadata } from "next"

import { getProject } from "@/lib/mock/projects"
import { ProjectDetailVariants } from "@/components/admin/projects/project-detail-variants"
import { DETAIL_LAYOUTS, type DetailLayout } from "@/components/admin/projects/variant-types"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const project = getProject(id)
  return {
    title: project ? `${project.name} — Clover Admin` : "Project — Clover Admin",
  }
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ layout?: string }>
}) {
  const { id } = await params
  const { layout } = await searchParams
  const project = getProject(id)

  if (!project) {
    return <div className="p-6 text-sm text-muted-foreground">Project not found.</div>
  }

  const detailLayout: DetailLayout = DETAIL_LAYOUTS.includes(layout as DetailLayout)
    ? (layout as DetailLayout)
    : "tabs"

  return <ProjectDetailVariants project={project} layout={detailLayout} />
}
