import type { Metadata } from "next"

import { ClientsList } from "@/components/admin/clients/clients-list"

export const metadata: Metadata = {
  title: "Clients — Clover Admin",
}

// The detail panel is driven by the `?c=<id>` search param (no intercepting
// routes — those collided with /clients/new). Reading it here keeps the page a
// server component; the list stays mounted as the param changes.
export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>
}) {
  const { c } = await searchParams
  return <ClientsList selectedId={c} />
}
