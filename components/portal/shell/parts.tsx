"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Sun03Icon,
  Moon02Icon,
  ComputerIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"
import { CloverMark } from "@/components/admin/auth/clover-mark"

/** Up to two initials from a company name — the profile card's mark. */
export function companyInitials(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/** What this product is, at the top of the sidebar. The name is the portal, not
 * the client — the client's own identity belongs to the profile card below. */
export function PortalBrand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Clover client portal"
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-xl px-1 py-1.5 transition-colors hover:bg-muted/60",
        collapsed && "justify-center px-0"
      )}
    >
      <CloverMark className="size-6 shrink-0" />
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight">
            Clover
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Client portal
          </span>
        </span>
      )}
    </Link>
  )
}

/** Who you're signed in as, plus the way out — the foot of the sidebar. */
export function ProfileCard({
  company,
  name,
  collapsed,
  onSignOut,
}: {
  company: string
  name?: string | null
  collapsed?: boolean
  onSignOut: () => void
}) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span
          title={[company, name].filter(Boolean).join(" · ")}
          className="flex size-8 items-center justify-center rounded-lg bg-muted font-mono text-[11px] font-semibold text-muted-foreground"
        >
          {companyInitials(company)}
        </span>
        <SignOutButton onSignOut={onSignOut} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-1.5 pl-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background font-mono text-[11px] font-semibold text-muted-foreground">
        {companyInitials(company)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{company}</span>
        {name && (
          <span className="block truncate text-xs text-muted-foreground">{name}</span>
        )}
      </span>
      <SignOutButton onSignOut={onSignOut} />
    </div>
  )
}

export function SignOutButton({ onSignOut }: { onSignOut: () => void }) {
  return (
    <button
      type="button"
      aria-label="Sign out"
      onClick={onSignOut}
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
    >
      <HugeiconsIcon icon={Logout01Icon} className="size-4.5" />
    </button>
  )
}

const THEMES = [
  { value: "light", label: "Light", icon: Sun03Icon },
  { value: "system", label: "System", icon: ComputerIcon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
] as const

/**
 * Three-way theme control.
 *
 * Three segments, not a two-state toggle: the app's default is `system`, and a
 * binary switch has no way back to it once tapped — the client would be stuck on
 * a fixed theme with no way to say "follow my machine" again.
 *
 * Reads `theme` (the stored preference) rather than `resolvedTheme` (what it
 * currently renders as), so "System" stays selected in the dark. next-themes
 * resolves client-side only, so nothing is marked selected until hydration.
 *
 * Collapsed, it degrades to a single button that cycles the three states —
 * a segmented control has nowhere to go in a 56px rail.
 */
export function ThemeSwitcher({
  collapsed,
  className,
}: {
  collapsed?: boolean
  className?: string
}) {
  const { theme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const current = hydrated ? (theme ?? "system") : null

  if (collapsed) {
    const index = THEMES.findIndex((t) => t.value === current)
    const active = THEMES[index === -1 ? 1 : index]
    const next = THEMES[(index === -1 ? 1 : index + 1) % THEMES.length]
    return (
      <button
        type="button"
        aria-label={`Theme: ${active.label}. Switch to ${next.label}`}
        title={`Theme: ${active.label}`}
        onClick={() => setTheme(next.value)}
        className={cn(
          "flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          className
        )}
      >
        <HugeiconsIcon icon={active.icon} className="size-4" />
      </button>
    )
  }

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
