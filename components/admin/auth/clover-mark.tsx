import { cn } from "@/lib/utils"

/** The Clover logo mark — the filled clover glyph from cloverdesign.xyz. Uses
 * `currentColor`, so it follows the surrounding text color (dark in light mode,
 * light in dark mode), matching the marketing site's nav treatment. Shared
 * across the shell and auth variants; each composes it however it likes. */
export function CloverMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 904.01 856.44"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7", className)}
    >
      <polygon points="785.53 743.9 686.53 662.94 733.85 780.08 624.94 856.44 452 569.75 279.07 856.44 170.15 780.08 217.47 662.94 118.48 743.9 0 660.88 124.29 456.48 268.78 427.92 128.64 400.93 7.5 186.61 124.89 109.88 216.5 184.43 184.91 70.55 292.74 0 452 284.27 611.26 0 719.09 70.55 687.5 184.43 779.11 109.88 896.5 186.61 775.24 400.93 635.22 427.92 779.72 456.48 904 660.88 785.53 743.9" />
    </svg>
  )
}

export function CloverWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <CloverMark />
      <span className="text-sm font-semibold tracking-tight">Clover</span>
    </div>
  )
}
