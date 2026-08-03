"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import {
  useNewClientDraft,
  STEPS,
  type NewClientDraft,
} from "@/components/admin/clients/new-client/fields"
import {
  EditorialFrame,
  EditorialFormPanel,
} from "@/components/admin/clients/new-client/editorial-parts"

const STEP_BLURB: Record<number, string> = {
  1: "Company, contact & currency",
  2: "Optional first project",
}

/** Left context column — a vertical wizard stepper. */
function Stepper({ draft }: { draft: NewClientDraft }) {
  const { step, setStep, clientValid } = draft
  return (
    <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Onboard a client</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Two quick steps. Their contact email becomes their portal sign-in.
        </p>

        <ol className="mt-8 flex flex-col">
          {STEPS.map((s, i) => {
            const done = step > s.n
            const active = step === s.n
            return (
              <li key={s.n} className="flex gap-3">
                {/* Rail + node */}
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : done
                          ? "bg-secondary text-secondary-foreground ring-1 ring-border"
                          : "bg-card text-muted-foreground ring-1 ring-border"
                    )}
                  >
                    {done ? <HugeiconsIcon icon={Tick02Icon} className="size-3.5" /> : s.n}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className={cn("my-1 w-px flex-1", done ? "bg-primary" : "bg-border")} />
                  )}
                </div>
                {/* Label */}
                <button
                  type="button"
                  onClick={() => (s.n === 1 || clientValid) && setStep(s.n)}
                  className="pb-6 text-left"
                >
                  <div className={cn("text-sm", active ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {s.label}
                  </div>
                  <div className="text-xs text-muted-foreground/70">{STEP_BLURB[s.n]}</div>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

/** New Client page — editorial split, stepper context on the left (30%), the
 * wizard form on the right (70%), full-bleed on the card surface. */
export function NewClientPage() {
  const draft = useNewClientDraft()
  return (
    <EditorialFrame
      left={<Stepper draft={draft} />}
      right={<EditorialFormPanel draft={draft} />}
    />
  )
}
