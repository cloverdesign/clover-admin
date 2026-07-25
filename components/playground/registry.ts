import {
  ColorsIcon,
  DashboardSquare01Icon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons"
import type { HugeiconsIcon } from "@hugeicons/react"
import type { ComponentProps } from "react"

export type SectionStatus = "ready" | "pending"

export type HugeiconRef = ComponentProps<typeof HugeiconsIcon>["icon"]

export interface PlaygroundSection {
  /** Stable id — used as the scroll anchor and the tweak-panel focus key. */
  id: string
  label: string
  /** Short one-liner shown under the section heading. */
  blurb?: string
  status: SectionStatus
}

export interface PlaygroundCategory {
  id: string
  label: string
  icon: HugeiconRef
  sections: PlaygroundSection[]
}

/**
 * The design-system information architecture. Drives both the left nav and the
 * center gallery. Section `status` flips to "ready" as each is built out
 * (Foundations = step ③, Components = step ④).
 */
export const PLAYGROUND_CATEGORIES: PlaygroundCategory[] = [
  {
    id: "foundations",
    label: "Foundations",
    icon: ColorsIcon,
    sections: [
      { id: "colors", label: "Colors & tokens", blurb: "Semantic color roles and the chart ramp.", status: "ready" },
      { id: "typography", label: "Typography", blurb: "Font families, scale, and weights.", status: "ready" },
      { id: "radius", label: "Radius", blurb: "The sm → 4xl corner-radius scale.", status: "ready" },
      { id: "spacing", label: "Spacing", blurb: "Spacing rhythm and layout units.", status: "ready" },
      { id: "shadows", label: "Shadows", blurb: "Elevation and border treatments.", status: "ready" },
      { id: "icons", label: "Icons", blurb: "Searchable hugeicons set.", status: "ready" },
    ],
  },
  {
    id: "components",
    label: "Components",
    icon: DashboardSquare01Icon,
    sections: [
      { id: "buttons", label: "Buttons", blurb: "All variants and sizes.", status: "ready" },
      { id: "badges", label: "Badges & pills", blurb: "Status, delta, and tag pills.", status: "ready" },
      { id: "inputs", label: "Inputs & forms", blurb: "Text, select, choice, and OTP inputs.", status: "ready" },
      { id: "navigation", label: "Navigation", blurb: "Tabs, segmented controls, breadcrumb.", status: "ready" },
      { id: "overlays", label: "Overlays", blurb: "Dialog, sheet, dropdown, popover, tooltip.", status: "ready" },
      { id: "data", label: "Data display", blurb: "Card, table, avatar, progress, chart.", status: "ready" },
      { id: "feedback", label: "Feedback", blurb: "Alert and toast.", status: "ready" },
    ],
  },
  {
    id: "motion",
    label: "Motion",
    icon: SlidersHorizontalIcon,
    sections: [
      { id: "dialkit", label: "Interactive (DialKit)", blurb: "Real-time parameter tweaking powered by DialKit.", status: "ready" },
    ],
  },
]

export const ALL_SECTIONS: PlaygroundSection[] = PLAYGROUND_CATEGORIES.flatMap(
  (category) => category.sections
)
