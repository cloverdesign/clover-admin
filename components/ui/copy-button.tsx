"use client"

import * as React from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Copy01Icon, type Copy01IconHandle } from "@/components/ui/copy-01"

/**
 * Click-to-copy affordance built on the animated Copy icon. Copies `value` to the
 * clipboard, plays the icon animation, and confirms with a toast. Stops event
 * propagation so it's safe to place inside clickable rows.
 */
export function CopyButton({
  value,
  label = "value",
  size = 14,
  className,
}: {
  value: string
  /** What's being copied — used in the aria-label and toast, e.g. "email". */
  label?: string
  size?: number
  className?: string
}) {
  const iconRef = React.useRef<Copy01IconHandle>(null)

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      iconRef.current?.startAnimation()
      toast.success(`Copied ${label}`)
    } catch {
      toast.error("Couldn’t copy to clipboard")
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
    >
      <Copy01Icon ref={iconRef} size={size} />
    </button>
  )
}
