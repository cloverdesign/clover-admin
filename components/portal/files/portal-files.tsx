"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs"
import {
  usePortalAllDeliverables,
  usePortalProjects,
} from "@/lib/queries/portal-queries"
import {
  PortalPage,
  PortalTab,
  PortalTableFooter,
} from "@/components/portal/shell/portal-page"
import { DeliverableList } from "@/components/portal/deliverables/deliverable-list"

const ALL = "all"

/**
 * Every file the studio has shipped, across the whole engagement — the page that
 * `GET /api/portal/deliverables` made possible. Before that endpoint the only
 * way to assemble this was one request per project, so finished work was only
 * ever visible inside the project that produced it.
 */
export function PortalFiles() {
  const deliverablesQ = usePortalAllDeliverables()
  const projectsQ = usePortalProjects()
  const [tab, setTab] = React.useState(ALL)

  const projects = projectsQ.data ?? []
  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "A project"

  if (deliverablesQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (deliverablesQ.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your files.</p>
        <Button variant="outline" size="sm" onClick={() => deliverablesQ.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const all = deliverablesQ.data ?? []
  const ready = (list: typeof all) => list.filter((d) => d.status === "READY")
  // Only tab by project once more than one has shipped something.
  const withFiles = projects.filter((p) => all.some((d) => d.projectId === p.id))
  const tabbed = withFiles.length > 1

  const forTab = (key: string) =>
    key === ALL ? all : all.filter((d) => d.projectId === key)
  const shown = forTab(tab)

  return (
    <Tabs value={tab} onValueChange={(v) => v && setTab(v)} className="gap-0">
      <PortalPage
        title="Files"
        count={ready(all).length}
        tabs={
          tabbed ? (
            <TabsList variant="line">
              <PortalTab value={ALL} count={ready(all).length}>
                All
              </PortalTab>
              {withFiles.map((p) => (
                <PortalTab
                  key={p.id}
                  value={p.id}
                  count={ready(forTab(p.id)).length}
                >
                  {p.name}
                </PortalTab>
              ))}
            </TabsList>
          ) : null
        }
      >
        {tabbed ? (
          <>
            <TabsContent value={ALL}>
              <FilesTable deliverables={all} projectName={projectName} />
            </TabsContent>
            {withFiles.map((p) => (
              <TabsContent key={p.id} value={p.id}>
                <FilesTable deliverables={forTab(p.id)} />
              </TabsContent>
            ))}
          </>
        ) : (
          <FilesTable deliverables={shown} />
        )}
      </PortalPage>
    </Tabs>
  )
}

function FilesTable({
  deliverables,
  projectName,
}: {
  deliverables: React.ComponentProps<typeof DeliverableList>["deliverables"]
  projectName?: (projectId: string) => string
}) {
  const count = deliverables.filter((d) => d.status === "READY").length
  return (
    <>
      <DeliverableList
        deliverables={deliverables}
        projectName={projectName}
        emptyMessage="Finished work shows up here as your studio ships it."
      />
      {count > 0 && (
        <PortalTableFooter>
          {count} file{count === 1 ? "" : "s"}
        </PortalTableFooter>
      )}
    </>
  )
}
