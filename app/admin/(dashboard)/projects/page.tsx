import type { Metadata } from "next"

import { ProjectsList } from "@/components/admin/projects/projects-list"

export const metadata: Metadata = {
  title: "Projects — Clover Admin",
}

export default function ProjectsPage() {
  return <ProjectsList />
}
