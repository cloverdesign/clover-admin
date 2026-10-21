"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMe } from "@/lib/queries/auth-queries"
import { canAccessAdminRoute } from "@/lib/access"
import { Button } from "@/components/ui/button"

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe()
  const pathname = usePathname()
  if (!canAccessAdminRoute(me, pathname)) {
    return <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Access restricted</h1>
      <p className="text-sm text-muted-foreground">Your role doesn’t include access to this area.</p>
      <Button render={<Link href="/admin/projects" />}>Back to projects</Button>
    </div>
  }
  return children
}
