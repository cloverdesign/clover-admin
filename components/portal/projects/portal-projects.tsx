"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  Folder01Icon,
  GitBranchIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { usePortalProjects } from "@/lib/queries/portal-queries"
import { ProjectStatusBadge, ProgressBar } from "@/components/portal/parts"
import {
  PortalPage,
  PortalTab,
  PortalTableFooter,
} from "@/components/portal/shell/portal-page"
import type { Project } from "@/lib/api/models"

const SLICES = ["active", "completed", "all"] as const
type Slice = (typeof SLICES)[number]

const SLICE_LABEL: Record<Slice, string> = {
  active: "Active",
  completed: "Completed",
  all: "All",
}

function isActive(p: Project): boolean {
  return !p.archived && p.status !== "COMPLETED" && p.status !== "CANCELLED"
}

function inSlice(p: Project, slice: Slice): boolean {
  if (slice === "active") return isActive(p)
  if (slice === "completed") return !isActive(p)
  return true
}

/** A project plus how deep it sits — a revision is shown indented under the
 * project it branched from, which a flat table can't express structurally. */
type ProjectRow = { project: Project; isRevision: boolean }

/**
 * All projects — the complete engagement as one table, revisions indented under
 * the project they branch from. The dashboard spotlights and summarizes; this is
 * the exhaustive view behind the "All projects" link.
 */
export function PortalProjects() {
  const { data: projects, isLoading, isError } = usePortalProjects()
  const [tab, setTab] = React.useState<Slice>("active")
  const router = useRouter()

  const columns = React.useMemo<ColumnDef<ProjectRow>[]>(
    () => [
      {
        id: "name",
        accessorFn: (r) => r.project.name,
        header: ({ column }) => <DataTableSortHeader column={column} title="Project" />,
        cell: ({ row }) => (
          <div
            className={cn(
              "flex min-w-0 items-center gap-2.5",
              row.original.isRevision && "pl-5"
            )}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon
                icon={row.original.isRevision ? GitBranchIcon : Folder01Icon}
                className="size-3.5"
              />
            </span>
            <span className="truncate font-medium">{row.original.project.name}</span>
          </div>
        ),
      },
      {
        id: "type",
        accessorFn: (r) => r.project.type ?? "",
        header: ({ column }) => <DataTableSortHeader column={column} title="Type" />,
        cell: ({ row }) => (
          <span className="truncate text-muted-foreground">
            {row.original.project.type || "—"}
          </span>
        ),
      },
      {
        id: "phase",
        accessorFn: (r) => r.project.phase ?? "",
        header: ({ column }) => <DataTableSortHeader column={column} title="Stage" />,
        cell: ({ row }) => (
          <span className="truncate text-muted-foreground">
            {row.original.project.phase || "—"}
          </span>
        ),
      },
      {
        id: "progress",
        accessorFn: (r) => r.project.progress,
        header: ({ column }) => <DataTableSortHeader column={column} title="Progress" />,
        cell: ({ row }) => (
          <div className="flex w-24 items-center gap-2">
            <ProgressBar value={row.original.project.progress} className="h-1.5" />
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {Math.round(row.original.project.progress)}%
            </span>
          </div>
        ),
      },
      {
        id: "status",
        accessorFn: (r) => r.project.status,
        header: ({ column }) => <DataTableSortHeader column={column} title="Status" />,
        cell: ({ row }) => <ProjectStatusBadge status={row.original.project.status} />,
      },
      {
        id: "endDate",
        accessorFn: (r) => r.project.endDate ?? "",
        header: ({ column }) => <DataTableSortHeader column={column} title="Target" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatDate(row.original.project.endDate)}
          </span>
        ),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError || !projects) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your projects.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const roots = projects.filter((p) => !p.parentProjectId)
  const orphans = projects.filter(
    (p) => p.parentProjectId && !projects.some((x) => x.id === p.parentProjectId)
  )
  const topLevel = [...roots, ...orphans]
  const childrenOf = (id: string) => projects.filter((p) => p.parentProjectId === id)

  /** Flatten to rows, each parent immediately followed by its revisions. A
   * revision follows its parent regardless of slice — hiding a completed
   * revision under an active project would leave the history with a gap. */
  const rowsFor = (slice: Slice): ProjectRow[] =>
    topLevel
      .filter((p) => inSlice(p, slice))
      .flatMap((p) => [
        { project: p, isRevision: false },
        ...childrenOf(p.id).map((child) => ({ project: child, isRevision: true })),
      ])

  const hasCompleted = topLevel.some((p) => !isActive(p))

  if (projects.length === 0) {
    return (
      <PortalPage title="Your projects">
        <EmptyState
          bordered
          icon={Folder01Icon}
          title="No projects yet"
          description="Your studio will add your project here soon."
        />
      </PortalPage>
    )
  }

  return (
    <Tabs value={tab} onValueChange={(v) => v && setTab(v as Slice)} className="gap-0">
      <PortalPage
        title="Your projects"
        count={rowsFor("all").length}
        tabs={
          hasCompleted ? (
            <TabsList variant="line">
              {SLICES.map((slice) => (
                <PortalTab key={slice} value={slice} count={rowsFor(slice).length}>
                  {SLICE_LABEL[slice]}
                </PortalTab>
              ))}
            </TabsList>
          ) : null
        }
      >
        {(hasCompleted ? SLICES : (["active"] as const)).map((slice) => {
          const rows = hasCompleted ? rowsFor(slice) : rowsFor("all")
          const body =
            rows.length === 0 ? (
              <EmptyState
                bordered
                size="sm"
                icon={Folder01Icon}
                title="Nothing here"
                description={
                  slice === "active"
                    ? "Nothing in flight right now."
                    : "No completed projects yet."
                }
              />
            ) : (
              <>
                <DataTable
                  columns={columns}
                  data={rows}
                  onRowClick={(r) => router.push(`/projects/${r.project.id}`)}
                />
                <PortalTableFooter>
                  {rows.length} project{rows.length === 1 ? "" : "s"}
                </PortalTableFooter>
              </>
            )

          return hasCompleted ? (
            <TabsContent key={slice} value={slice}>
              {body}
            </TabsContent>
          ) : (
            <React.Fragment key={slice}>{body}</React.Fragment>
          )
        })}
      </PortalPage>
    </Tabs>
  )
}
