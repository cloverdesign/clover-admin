"use client"

import { motion, type Transition } from "motion/react"
import { useDialKit } from "dialkit"

import { SpecimenGroup } from "@/components/playground/section"

/**
 * Live DialKit specimen. Every visual property of this card — radius, padding,
 * elevation, accent, and the lift spring — is driven by `useDialKit`, so
 * dragging a control in the floating dial panel (bottom-right) updates it in
 * real time. This is the "does DialKit work inside the playground?" proof:
 * DialKit owns transient prop tweaking, while the existing TweakPanel keeps
 * owning persistent design-token overrides.
 *
 * Rendered client-only (see ./motion.tsx) because DialKit resolves values from
 * a browser store, which would otherwise trip an SSR hydration mismatch.
 */
export function MotionDemo() {
  const card = useDialKit(
    "Preview card",
    {
      radius: [20, 0, 48],
      padding: [28, 12, 56],
      accent: { type: "color" as const, default: "#84cc16" },
      elevation: [18, 0, 60],
      lifted: false,
      spring: { type: "spring" as const, visualDuration: 0.5, bounce: 0.25 },
    },
    { id: "playground-preview-card", persist: true }
  )

  return (
    <SpecimenGroup label="Live specimen — drag the dials in the panel (bottom-right)">
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-muted/30 p-8">
        <motion.div
          animate={{ scale: card.lifted ? 1.06 : 1, y: card.lifted ? -8 : 0 }}
          transition={card.spring as Transition}
          style={{
            borderRadius: card.radius,
            padding: card.padding,
            boxShadow: `0 ${card.elevation}px ${card.elevation * 2}px -12px rgb(0 0 0 / 0.25)`,
          }}
          className="w-full max-w-sm bg-card"
        >
          <div className="flex items-center gap-3">
            <span
              className="size-9 shrink-0 rounded-full"
              style={{ background: card.accent }}
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">Atlas Foods</div>
              <div className="truncate text-xs text-muted-foreground">
                Site build · Design
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Every value on this card is driven live by DialKit. Drag the dials
            and watch it respond.
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: "62%", background: card.accent }}
            />
          </div>
        </motion.div>
      </div>
    </SpecimenGroup>
  )
}
