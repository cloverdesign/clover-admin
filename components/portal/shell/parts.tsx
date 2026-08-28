"use client"

import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Sun03Icon,
  Moon02Icon,
  ComputerIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"

/** Who you're signed in as — sits beside the Clover mark at the top of the
 * sidebar. No monogram of its own: the mark is already the row's graphic. */
export function ClientChip({
  company,
  name,
  className,
}: {
  company: string
  name?: string | null
  className?: string
}) {
  return (
    <span className={cn("min-w-0", className)}>
      <span className="block truncate text-sm font-medium">{company}</span>
      {name && (
        <span className="block truncate text-xs text-muted-foreground">{name}</span>
      )}
    </span>
  )
}

const THEMES = [
  { value: "light", label: "Light", icon: Sun03Icon },
  { value: "system", label: "System", icon: ComputerIcon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
] as const

/**
 * Three-way theme control for the portal sidebar.
 *
 * Three segments, not a two-state toggle: the app's default is `system`, and a
 * binary switch has no way back to it once tapped — the client would be stuck on
 * a fixed theme with no way to say "follow my machine" again.
 *
 * Reads `theme` (the stored preference) rather than `resolvedTheme` (what it
 * currently renders as), so "System" stays selected in the dark. next-themes
 * resolves client-side only, so nothing is marked selected until hydration.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const current = hydrated ? (theme ?? "system") : null

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "flex items-center gap-0.5 rounded-full bg-muted/60 p-0.5",
        className
      )}
    >
      {THEMES.map((option) => {
        const selected = current === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex h-7 flex-1 items-center justify-center rounded-full transition-colors",
              selected
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HugeiconsIcon icon={option.icon} className="size-4" />
          </button>
        )
      })}
    </div>
  )
}
