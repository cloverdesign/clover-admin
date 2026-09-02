"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, GitBranchIcon } from "@hugeicons/core-free-icons"

import { byNewest, formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs"
import { DataTable, DataTableSortHeader } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { usePortalRevisions, usePortalProjects } from "@/lib/queries/portal-queries"
import {
  RevisionCard,
  RevisionStatusBadge,
} from "@/components/portal/projects/portal-revisions"
import { RequestRevisionButton } from "@/components/portal/home/dashboard-sections"
import {
  PortalPage,
  PortalTab,
  PortalTableFooter,
} from "@/components/portal/shell/portal-page"
import type { RevisionRequest } from "@/lib/api/models"

const SLICES = ["open", "resolved", "all"] as const
type Slice = (typeof SLICES)[number]

const SLICE_LABEL: Record<Slice, string> = {
  open: "Open",
  resolved: "Resolved",
  all: "All",
}

function isOpen(r: RevisionRequest): boolean {
  return r.status === "REQUESTED" || r.status === "IN_REVIEW"
}

/** First line of the description — a request has no title of its own. */
function requestTitle(description: string): string {
  const line = description.trim().split("\n")[0]
  return line || "Revision request"
}

/**
 * Revision requests hub — every request the client has raised, across all their
 * projects. The per-project view shows the same requests scoped to one project;
 * this is the cross-project home for them, reachable from the shell nav.
 */
export function PortalRequests() {
  const { data: revisions, isLoading, isError } = usePortalRevisions()
  const { data: projects } = usePortalProjects()
  const [tab, setTab] = React.useState<Slice>("open")
  const [openId, setOpenId] = React.useState<string | null>(null)

  const projectName = React.useCallback(
    (id: string) => projects?.find((p) => p.id === id)?.name ?? "a project",
    [projects]
  )

  const columns = React.useMemo<ColumnDef<RevisionRequest>[]>(
    () => [
      {
        id: "title",
        accessorFn: (r) => requestTitle(r.description),
        header: ({ column }) => <DataTableSortHeader column={column} title="Request" />,
        // Capped: a request has no title, so this is its first line of prose,
        // and an uncapped cell lets one long request push Status off the table.
        cell: ({ getValue }) => (
          <span className="block max-w-[22rem] truncate font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "project",
        accessorFn: (r) => projectName(r.projectId),
        header: ({ column }) => <DataTableSortHeader column={column} title="Project" />,
        cell: ({ getValue }) => (
          <span className="truncate text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: "createdAt",
        accessorFn: (r) => r.createdAt,
        header: ({ column }) => <DataTableSortHeader column={column} title="Raised" />,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (r) => r.status,
        header: ({ column }) => <DataTableSortHeader column={column} title="Status" />,
        cell: ({ row }) => <RevisionStatusBadge status={row.original.status} />,
      },
    ],
    [projectName]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError || !revisions) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your requests.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const sorted = [...revisions].sort((a, b) => byNewest(a.createdAt, b.createdAt))
  const forSlice = (slice: Slice) =>
    sorted.filter((r) => (slice === "open" ? isOpen(r) : slice === "resolved" ? !isOpen(r) : true))
  const active = sorted.find((r) => r.id === openId) ?? null

  const action =
    projects && projects.length > 0 ? (
      <RequestRevisionButton projects={projects} />
    ) : undefined

  if (revisions.length === 0) {
    return (
      <PortalPage title="Revision requests" action={action}>
        <EmptyState
          bordered
          icon={GitBranchIcon}
          title="No requests yet"
          description="Need a change on a project? Raise a revision and your studio takes it from there."
        />
      </PortalPage>
    )
  }

  return (
    <Tabs value={tab} onValueChange={(v) => v && setTab(v as Slice)} className="gap-0">
      <PortalPage
        title="Revision requests"
        count={revisions.length}
        action={action}
        tabs={
          <TabsList variant="line">
            {SLICES.map((slice) => (
              <PortalTab key={slice} value={slice} count={forSlice(slice).length}>
                {SLICE_LABEL[slice]}
              </PortalTab>
            ))}
          </TabsList>
        }
      >
        {SLICES.map((slice) => {
          const rows = forSlice(slice)
          return (
            <TabsContent key={slice} value={slice}>
              {rows.length === 0 ? (
                <EmptyState
                  bordered
                  size="sm"
                  icon={GitBranchIcon}
                  title="Nothing here"
                  description={
                    slice === "open"
                      ? "Nothing open. Every request has been decided."
                      : "No resolved requests yet."
                  }
                />
              ) : (
                <>
                  <DataTable
                    columns={columns}
                    data={rows}
                    onRowClick={(r) => setOpenId(r.id)}
                  />
                  <PortalTableFooter>
                    {rows.length} request{rows.length === 1 ? "" : "s"}
                  </PortalTableFooter>
                </>
              )}
            </TabsContent>
          )
        })}
      </PortalPage>

      {/* The row can't carry the request's progress stepper or the studio's
          decision note, so the full card moves into a panel. */}
      <Sheet open={active !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="pr-6">
                  {requestTitle(active.description)}
                </SheetTitle>
                <SheetDescription>
                  {projectName(active.projectId)} · raised {formatDate(active.createdAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <ul>
                  <RevisionCard request={active} />
                </ul>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Tabs>
  )
}
