import type { Metadata } from "next"

import { SettingsPage } from "@/components/admin/settings/settings-page"

export const metadata: Metadata = {
  title: "Settings — Clover Admin",
}

export default function AdminSettingsPage() {
  return <SettingsPage />
}
