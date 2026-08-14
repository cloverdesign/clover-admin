import type { Metadata } from "next"

import { EditClientPage } from "@/components/admin/clients/edit-client/edit-client-page"

export const metadata: Metadata = {
  title: "Edit client — Clover Admin",
}

export default async function EditClientRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditClientPage id={id} />
}
