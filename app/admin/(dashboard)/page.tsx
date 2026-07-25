import type { Metadata } from "next"

import { DASHBOARD_DATA } from "@/lib/mock/dashboard"
import { Dashboard } from "@/components/admin/dashboard/dashboard"

export const metadata: Metadata = {
  title: "Clover Admin — Dashboard",
}

export default function AdminDashboardPage() {
  return <Dashboard data={DASHBOARD_DATA} />
}
