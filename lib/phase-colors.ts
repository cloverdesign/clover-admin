import type { Phase } from "@/lib/mock/dashboard"

/** Canonical phase order (Kickoff → Launch). */
export const PHASE_ORDER: Phase[] = [
  "Kickoff",
  "Discovery",
  "Design",
  "Development",
  "Launch",
]

/**
 * Single source of truth for phase colors — a categorical palette drawn from our
 * ramps / semantic hues, as CSS custom-property strings so it works for both
 * inline `style` (SVG fills, badge dots) and anywhere else. Used by the phase
 * badges, the phases gauge, and the project timeline so a phase reads the same
 * color everywhere.
 */
export const PHASE_COLOR: Record<Phase, string> = {
  Kickoff: "var(--color-neutral-400)",
  Discovery: "var(--color-violet-400)",
  Design: "var(--color-lime-400)",
  Development: "var(--color-amber-400)",
  Launch: "var(--color-red-400)",
}
