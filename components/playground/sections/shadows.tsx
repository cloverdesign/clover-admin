import { SpecimenGroup } from "@/components/playground/section"

const SHADOWS = [
  { cls: "shadow-xs", label: "xs" },
  { cls: "shadow-sm", label: "sm" },
  { cls: "shadow-md", label: "md" },
  { cls: "shadow-lg", label: "lg" },
  { cls: "shadow-xl", label: "xl" },
  { cls: "shadow-2xl", label: "2xl" },
]

const BORDERS = [
  { cls: "border", label: "border" },
  { cls: "border-2", label: "border-2" },
  { cls: "ring-2 ring-ring/50", label: "ring" },
  { cls: "border border-dashed", label: "dashed" },
]

export function ShadowsSection() {
  return (
    <div className="flex flex-col gap-8">
      <SpecimenGroup label="Elevation">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SHADOWS.map((s) => (
            <div key={s.cls} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-16 w-full items-center justify-center rounded-xl bg-card ${s.cls}`}
              />
              <span className="font-mono text-[11px] text-muted-foreground">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Borders">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BORDERS.map((b) => (
            <div key={b.label} className="flex flex-col items-center gap-2">
              <div className={`h-16 w-full rounded-xl bg-card ${b.cls}`} />
              <span className="font-mono text-[11px] text-muted-foreground">
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </SpecimenGroup>
    </div>
  )
}
