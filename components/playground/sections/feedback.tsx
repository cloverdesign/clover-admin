"use client"

import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon, Alert02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { SpecimenGroup } from "@/components/playground/section"

export function FeedbackSection() {
  return (
    <div className="flex flex-col gap-8">
      <SpecimenGroup label="Alerts">
        <div className="flex flex-col gap-3">
          <Alert>
            <HugeiconsIcon icon={InformationCircleIcon} />
            <AlertTitle>Build in progress</AlertTitle>
            <AlertDescription>
              Publishing triggers a Vercel rebuild — this can take a minute.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <HugeiconsIcon icon={Alert02Icon} />
            <AlertTitle>Invoice overdue</AlertTitle>
            <AlertDescription>
              This invoice passed its due date and hasn’t been paid.
            </AlertDescription>
          </Alert>
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Toasts">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => toast("Milestone updated")}>
            Default
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Invoice sent to client")}
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("Failed to upload deliverable")}
          >
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast("Deliverable ready", {
                description: "The client has been notified by email.",
                action: { label: "View", onClick: () => {} },
              })
            }
          >
            With action
          </Button>
        </div>
      </SpecimenGroup>
    </div>
  )
}
