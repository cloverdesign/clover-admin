import type { ComponentType } from "react"

import { ColorsSection } from "@/components/playground/sections/colors"
import { TypographySection } from "@/components/playground/sections/typography"
import { RadiusSection } from "@/components/playground/sections/radius"
import { SpacingSection } from "@/components/playground/sections/spacing"
import { ShadowsSection } from "@/components/playground/sections/shadows"
import { IconsSection } from "@/components/playground/sections/icons"
import { ButtonsSection } from "@/components/playground/sections/buttons"
import { BadgesSection } from "@/components/playground/sections/badges"
import { InputsSection } from "@/components/playground/sections/inputs"
import { NavigationSection } from "@/components/playground/sections/navigation"
import { OverlaysSection } from "@/components/playground/sections/overlays"
import { DataSection } from "@/components/playground/sections/data"
import { FeedbackSection } from "@/components/playground/sections/feedback"

/**
 * Maps a registry section id to its gallery content. Sections absent from this
 * map fall back to the "coming soon" state in <Section>.
 */
export const SECTION_CONTENT: Record<string, ComponentType> = {
  colors: ColorsSection,
  typography: TypographySection,
  radius: RadiusSection,
  spacing: SpacingSection,
  shadows: ShadowsSection,
  icons: IconsSection,
  buttons: ButtonsSection,
  badges: BadgesSection,
  inputs: InputsSection,
  navigation: NavigationSection,
  overlays: OverlaysSection,
  data: DataSection,
  feedback: FeedbackSection,
}
