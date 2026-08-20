import type { Metadata } from "next"

import { PortalProjects } from "@/components/portal/projects/portal-projects"

export const metadata: Metadata = {
  title: "Your projects — Clover Portal",
}

export default function PortalProjectsPage() {
  return <PortalProjects />
}
