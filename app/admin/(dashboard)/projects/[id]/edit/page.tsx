import type { Metadata } from "next"

import { EditProjectPage } from "@/components/admin/projects/edit-project/edit-project-page"

export const metadata: Metadata = {
  title: "Edit project — Clover Admin",
}

export default async function EditProjectRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditProjectPage id={id} />
}
