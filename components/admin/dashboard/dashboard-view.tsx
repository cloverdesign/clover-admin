"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { useDashboardData } from "@/lib/queries/dashboard-queries"
import { Dashboard } from "@/components/admin/dashboard/dashboard"
import { DashboardEmpty } from "@/components/admin/dashboard/dashboard-empty"

/** Client entry for the dashboard — composes live data and renders the
 * presentational Dashboard (loading / error / empty handled here). */
export function DashboardView() {
  const { data, isLoading, isError } = useDashboardData()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load the dashboard.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }
  if (data.projects.length === 0) return <DashboardEmpty />

  return <Dashboard data={data} />
}
