import type { Metadata } from "next"

import { TeamPage } from "@/components/admin/team/team-page"

export const metadata: Metadata = {
  title: "Team — Clover Admin",
}

export default function AdminTeamPage() {
  return <TeamPage />
}
