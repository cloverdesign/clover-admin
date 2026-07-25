import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { SpecimenGroup } from "@/components/playground/section"

const VARIANTS = ["default", "secondary", "outline", "destructive", "ghost"] as const

const SEMANTIC = ["success", "warning", "info", "destructive"] as const

const STATUSES = [
  { label: "Normal", dot: "bg-chart-3" },
  { label: "In progress", dot: "bg-chart-5" },
  { label: "Overdue", dot: "bg-destructive" },
  { label: "Draft", dot: "bg-muted-foreground" },
] as const

export function BadgesSection() {
  return (
    <div className="flex flex-col gap-8">
      <SpecimenGroup label="Variants">
        <div className="flex flex-wrap items-center gap-2">
          {VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Semantic">
        <div className="flex flex-wrap items-center gap-2">
          {SEMANTIC.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Status pills">
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((s) => (
            <Badge key={s.label} variant="outline" className="gap-1.5">
              <span className={`size-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </Badge>
          ))}
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Deltas">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="gap-1 bg-chart-3/15 text-chart-3">
            <HugeiconsIcon icon={ArrowUp01Icon} data-icon="inline-start" />
            12.4%
          </Badge>
          <Badge className="gap-1 bg-destructive/10 text-destructive">
            <HugeiconsIcon icon={ArrowDown01Icon} data-icon="inline-start" />
            3.1%
          </Badge>
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Tags">
        <div className="flex flex-wrap items-center gap-2">
          {["Dashboard", "Design", "Hard", "Launch"].map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </SpecimenGroup>
    </div>
  )
}
