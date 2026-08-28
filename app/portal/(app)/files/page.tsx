import type { Metadata } from "next"

import { PortalFiles } from "@/components/portal/files/portal-files"

export const metadata: Metadata = {
  title: "Files — Clover Portal",
}

export default function PortalFilesPage() {
  return <PortalFiles />
}
