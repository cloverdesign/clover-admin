import { cn } from "@/lib/utils"

/** The Clover wordmark glyph — a small rounded square. Shared across auth
 * variants; each variant composes it however it likes. */
export function CloverMark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("size-7 rounded-lg bg-primary", className)}
    />
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
