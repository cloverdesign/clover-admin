import type { Metadata } from "next"

import { NewProjectPage } from "@/components/admin/clients/new-project/new-project-page"

export const metadata: Metadata = {
  title: "New project — Clover Admin",
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const { client } = await searchParams
  return <NewProjectPage clientId={client} />
}
