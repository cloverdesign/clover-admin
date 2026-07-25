"use client"

import { useComputedTokens } from "@/components/playground/use-tokens"

const STEPS = [1, 2, 3, 4, 6, 8, 12, 16, 24]

function toPx(value: string) {
  const num = parseFloat(value)
  if (Number.isNaN(num)) return 4
  return value.includes("rem") ? num * 16 : num
}

export function SpacingSection() {
  const { "--spacing": spacing } = useComputedTokens(["--spacing"])
  const unitPx = spacing ? toPx(spacing) : 4

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Base unit</span>
        <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
          --spacing: {spacing || "0.25rem"}
        </code>
      </div>
      <div className="flex flex-col gap-2">
        {STEPS.map((step) => {
          const px = Math.round(unitPx * step)
          return (
            <div key={step} className="flex items-center gap-4">
              <span className="w-8 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {step}
              </span>
              <div
                className="h-4 rounded-sm bg-chart-3"
                style={{ width: `${px}px` }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {px}px
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
