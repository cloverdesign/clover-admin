import type { Metadata } from "next"

import { getProject } from "@/lib/mock/projects"
import { EditProjectPage } from "@/components/admin/projects/edit-project/edit-project-page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const project = getProject(id)
  return {
    title: project ? `Edit ${project.name} — Clover Admin` : "Edit project — Clover Admin",
  }
}

export default async function EditProjectRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditProjectPage id={id} />
}
