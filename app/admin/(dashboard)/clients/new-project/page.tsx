import { redirect } from "next/navigation"

/**
 * Legacy route — new-project moved to /admin/projects/new (a stepped flow that
 * picks or creates its own client). Preserve the `?client=` scope on the way.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const { client } = await searchParams
  redirect(client ? `/admin/projects/new?client=${client}` : "/admin/projects/new")
}
