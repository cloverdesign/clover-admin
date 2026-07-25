"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // next-themes resolves the theme only on the client; avoid a hydration flash.
  React.useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            <HugeiconsIcon icon={mounted && isDark ? Sun03Icon : Moon02Icon} />
          </Button>
        }
      />
      <TooltipContent>
        {mounted && isDark ? "Switch to light" : "Switch to dark"}
        <span className="ml-1 text-background/60">(D)</span>
      </TooltipContent>
    </Tooltip>
  )
}
