"use client"

import { Button } from "@/components/ui/button"
import {
  type NewClientDraft,
  ClientDetailsFields,
  ProjectDetailsFields,
} from "@/components/admin/clients/new-client/fields"

/** Two-column layout shared by every editorial variation. Full-bleed on the
 * card surface (same as the top nav) — negative margins cancel the main
 * scroll area's padding so there's no darker frame or border around it. `left`
 * is the branded/context panel; the form panel is always on the right. */
export function EditorialFrame({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="-m-4 flex min-h-[calc(100%+2rem)] flex-col bg-card sm:-m-6 sm:min-h-[calc(100%+3rem)]">
      <div className="mx-auto grid h-full w-full max-w-5xl flex-1 grid-cols-1 md:grid-cols-[30%_70%]">
        {left}
        {right}
      </div>
    </div>
  )
}

/** The right-hand form column — identical across editorial variations. */
export function EditorialFormPanel({ draft }: { draft: NewClientDraft }) {
  const { step, setStep, clientValid, cancel, submit } = draft
  return (
    <div className="flex min-h-0 flex-col overflow-y-auto p-8">
      <h2 className="text-lg font-semibold tracking-tight">
        {step === 1 ? "Client details" : "First project"}
      </h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        {step === 1
          ? "Company, contact and billing currency."
          : `Add ${draft.client.company || "the client"}'s first project — optional.`}
      </p>

      {step === 1 ? (
        <ClientDetailsFields draft={draft} />
      ) : (
        <ProjectDetailsFields draft={draft} />
      )}

      <div className="mt-auto flex justify-end gap-2 pt-8">
        {step === 1 ? (
          <>
            <Button variant="outline" onClick={cancel}>Cancel</Button>
            <Button onClick={() => setStep(2)} disabled={!clientValid}>Next</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={submit}>Create client</Button>
          </>
        )}
      </div>
    </div>
  )
}
