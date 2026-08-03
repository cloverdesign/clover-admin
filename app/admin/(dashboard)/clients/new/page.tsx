import type { Metadata } from "next"

import { NewClientPage } from "@/components/admin/clients/new-client/new-client-page"

export const metadata: Metadata = {
  title: "New client — Clover Admin",
}

export default function Page() {
  return <NewClientPage />
}
