"use client"

import { useComputedTokens } from "@/components/playground/use-tokens"

// Mirrors the multipliers declared in globals.css `@theme inline`.
const STEPS = [
  { cls: "rounded-sm", label: "sm", mult: 0.6 },
  { cls: "rounded-md", label: "md", mult: 0.8 },
  { cls: "rounded-lg", label: "lg", mult: 1.0 },
  { cls: "rounded-xl", label: "xl", mult: 1.4 },
  { cls: "rounded-2xl", label: "2xl", mult: 1.8 },
  { cls: "rounded-3xl", label: "3xl", mult: 2.2 },
  { cls: "rounded-4xl", label: "4xl", mult: 2.6 },
]

function toPx(value: string) {
  const num = parseFloat(value)
  if (Number.isNaN(num)) return null
  if (value.includes("rem")) return num * 16
  return num
}

export function RadiusSection() {
  const { "--radius": radius } = useComputedTokens(["--radius"])
  const basePx = radius ? toPx(radius) : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Base</span>
        <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
          --radius: {radius || "—"}
        </code>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {STEPS.map((step) => {
          const px = basePx != null ? Math.round(basePx * step.mult) : null
          return (
            <div key={step.cls} className="flex flex-col items-center gap-2">
              <div
                className={`h-16 w-full border-2 border-primary/20 bg-primary/5 ${step.cls}`}
              />
              <div className="text-center">
                <div className="font-mono text-xs font-medium">{step.label}</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {px != null ? `${px}px` : "—"}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
