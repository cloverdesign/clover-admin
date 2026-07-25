import * as React from "react"

import { Badge } from "@/components/ui/badge"
import type { PlaygroundSection } from "@/components/playground/registry"

/**
 * The consistent card frame every gallery section renders inside: anchored
 * heading + blurb, then content. When a section has no content yet it shows a
 * "coming soon" pill instead.
 */
export function Section({
  section,
  children,
}: {
  section: PlaygroundSection
  children?: React.ReactNode
}) {
  const hasContent = children != null

  return (
    <div id={section.id} className="scroll-mt-6 rounded-2xl border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            {section.label}
          </h3>
          {section.blurb && (
            <p className="mt-1 text-sm text-muted-foreground">{section.blurb}</p>
          )}
        </div>
        {!hasContent && (
          <Badge variant="secondary" className="shrink-0 font-mono text-[11px]">
            coming soon
          </Badge>
        )}
      </div>
      {hasContent && <div className="mt-6">{children}</div>}
    </div>
  )
}

/** Small labelled group used within sections to separate specimen rows. */
export function SpecimenGroup({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <div className="mb-3 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </div>
      {children}
    </div>
  )
}
