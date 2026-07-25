"use client"

import { SpecimenGroup } from "@/components/playground/section"
import { useComputedTokens } from "@/components/playground/use-tokens"

const SPECIMEN = "The quick brown fox jumps"

const SCALE = [
  { cls: "text-4xl", label: "4xl" },
  { cls: "text-3xl", label: "3xl" },
  { cls: "text-2xl", label: "2xl" },
  { cls: "text-xl", label: "xl" },
  { cls: "text-lg", label: "lg" },
  { cls: "text-base", label: "base" },
  { cls: "text-sm", label: "sm" },
  { cls: "text-xs", label: "xs" },
]

const WEIGHTS = [
  { cls: "font-normal", label: "normal · 400" },
  { cls: "font-medium", label: "medium · 500" },
  { cls: "font-semibold", label: "semibold · 600" },
  { cls: "font-bold", label: "bold · 700" },
]

export function TypographySection() {
  const tokens = useComputedTokens(["--font-sans", "--font-mono"])

  return (
    <div className="flex flex-col gap-8">
      <SpecimenGroup label="Families">
        <div className="grid gap-3 sm:grid-cols-2">
          <FamilyCard
            name="Sans"
            varName="--font-sans"
            value={tokens["--font-sans"]}
            className="font-sans"
          />
          <FamilyCard
            name="Mono"
            varName="--font-mono"
            value={tokens["--font-mono"]}
            className="font-mono"
          />
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Type scale">
        <div className="flex flex-col divide-y">
          {SCALE.map((row) => (
            <div
              key={row.cls}
              className="flex items-baseline gap-4 py-2.5"
            >
              <span className="w-12 shrink-0 font-mono text-[11px] text-muted-foreground">
                {row.label}
              </span>
              <span className={`${row.cls} truncate tracking-tight`}>
                {SPECIMEN}
              </span>
            </div>
          ))}
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Weights">
        <div className="flex flex-col gap-2">
          {WEIGHTS.map((w) => (
            <div key={w.cls} className="flex items-baseline gap-4">
              <span className="w-28 shrink-0 font-mono text-[11px] text-muted-foreground">
                {w.label}
              </span>
              <span className={`${w.cls} text-lg`}>{SPECIMEN}</span>
            </div>
          ))}
        </div>
      </SpecimenGroup>
    </div>
  )
}

function FamilyCard({
  name,
  varName,
  value,
  className,
}: {
  name: string
  varName: string
  value?: string
  className: string
}) {
  // The raw var is a font stack starting with the CSS-module family name; show
  // the first family for readability.
  const primary = (value ?? "").split(",")[0]?.trim()
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{name}</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {varName}
        </span>
      </div>
      <p className={`mt-3 text-2xl tracking-tight ${className}`}>Ag 123</p>
      <p
        className="mt-1 truncate font-mono text-[10px] text-muted-foreground"
        title={value}
      >
        {primary || "—"}
      </p>
    </div>
  )
}
