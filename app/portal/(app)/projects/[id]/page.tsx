import type { Metadata } from "next"

import { PortalProject } from "@/components/portal/projects/portal-project"

export const metadata: Metadata = {
  title: "Project — Clover Portal",
}

export default async function PortalProjectRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PortalProject id={id} />
}
