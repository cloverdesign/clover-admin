import { HugeiconsIcon } from "@hugeicons/react"
import { GridViewIcon, LayoutTable01Icon } from "@hugeicons/core-free-icons"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SpecimenGroup } from "@/components/playground/section"

export function NavigationSection() {
  return (
    <div className="flex flex-col gap-8">
      <SpecimenGroup label="Tabs">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traces">Traces</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-3 text-muted-foreground">
            Overview panel content.
          </TabsContent>
          <TabsContent value="traces" className="pt-3 text-muted-foreground">
            Traces panel content.
          </TabsContent>
          <TabsContent value="connections" className="pt-3 text-muted-foreground">
            Connections panel content.
          </TabsContent>
        </Tabs>
      </SpecimenGroup>

      <SpecimenGroup label="Tabs · line">
        <Tabs defaultValue="subtasks">
          <TabsList variant="line">
            <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </Tabs>
      </SpecimenGroup>

      <SpecimenGroup label="Segmented control">
        <ToggleGroup defaultValue={["board"]} spacing={0} variant="outline">
          <ToggleGroupItem value="board">
            <HugeiconsIcon icon={GridViewIcon} data-icon="inline-start" />
            Board
          </ToggleGroupItem>
          <ToggleGroupItem value="list">
            <HugeiconsIcon icon={LayoutTable01Icon} data-icon="inline-start" />
            List
          </ToggleGroupItem>
        </ToggleGroup>
      </SpecimenGroup>

      <SpecimenGroup label="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Clients</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Acme Co.</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Website redesign</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </SpecimenGroup>
    </div>
  )
}
