import type { Metadata } from "next"

import { PortalHome } from "@/components/portal/home/portal-home"

export const metadata: Metadata = {
  title: "Your projects — Clover Portal",
}

export default function PortalHomePage() {
  return <PortalHome />
}
