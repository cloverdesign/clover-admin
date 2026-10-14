import type { Metadata } from "next"
import { RolesPage } from "@/components/admin/team/roles-page"

export const metadata: Metadata = {
  title: "Roles & permissions — Clover Admin",
}

export default function AdminRolesPage() {
  return <RolesPage />
}
