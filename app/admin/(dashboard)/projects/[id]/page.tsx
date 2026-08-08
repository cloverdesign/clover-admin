import type { Metadata } from "next"

import { getProject } from "@/lib/mock/projects"
import { ProjectDetail } from "@/components/admin/projects/project-detail"

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
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = getProject(id)

  if (!project) {
    return <div className="p-6 text-sm text-muted-foreground">Project not found.</div>
  }

  return <ProjectDetail project={project} />
}
