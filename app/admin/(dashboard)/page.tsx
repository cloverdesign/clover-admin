import type { Metadata } from "next"

import { DashboardView } from "@/components/admin/dashboard/dashboard-view"

export const metadata: Metadata = {
  title: "Clover Admin — Dashboard",
}

export default function AdminDashboardPage() {
  return <DashboardView />
}
