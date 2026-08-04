import type { Metadata } from "next"

import { getClient } from "@/lib/mock/clients"
import { EditClientPage } from "@/components/admin/clients/edit-client/edit-client-page"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const client = getClient(id)
  return {
    title: client ? `Edit ${client.company} — Clover Admin` : "Edit client — Clover Admin",
  }
}

export default async function EditClientRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditClientPage id={id} />
}
