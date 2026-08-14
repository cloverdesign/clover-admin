import { cn } from "@/lib/utils"

/**
 * Segmented progress meter — a row of discrete ticks filled to `value`%. The
 * prominent, block form of a progress bar: bars flex to fill the width, so it
 * reads the same in a wide admin card or a narrower portal panel. Height is
 * set by the caller via `className` (defaults tall). For the small inline meter
 * in table rows, use SegmentMeter instead.
 */
export function SegmentedProgress({
  value,
  segments = 30,
  className,
}: {
  value: number
  segments?: number
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const filled = Math.round((clamped / 100) * segments)
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("flex h-14 items-stretch gap-[3px]", className)}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "anim-grow flex-1 rounded-md",
            i < filled ? "bg-primary" : "bg-muted"
          )}
          style={{ animationDelay: `${i * 18}ms` }}
        />
      ))}
    </div>
  )
}
