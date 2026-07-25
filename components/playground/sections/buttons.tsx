import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, ArrowRight01Icon, Settings01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { SpecimenGroup } from "@/components/playground/section"

const VARIANTS = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
const SIZES = ["xs", "sm", "default", "lg"] as const

export function ButtonsSection() {
  return (
    <div className="flex flex-col gap-8">
      <SpecimenGroup label="Variants">
        <div className="flex flex-wrap items-center gap-3">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          {SIZES.map((size) => (
            <Button key={size} size={size}>
              Button {size}
            </Button>
          ))}
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="With icons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
            New client
          </Button>
          <Button variant="outline">
            Continue
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Settings">
            <HugeiconsIcon icon={Settings01Icon} />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Settings">
            <HugeiconsIcon icon={Settings01Icon} />
          </Button>
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="States">
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
        </div>
      </SpecimenGroup>
    </div>
  )
}
