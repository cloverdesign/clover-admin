import type { Metadata } from "next"

import { PortalLogin } from "@/components/portal/auth/portal-login"

export const metadata: Metadata = {
  title: "Sign in — Clover Portal",
}

export default function PortalLoginPage() {
  return <PortalLogin />
}
