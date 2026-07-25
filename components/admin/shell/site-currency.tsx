"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CURRENCIES, getCurrency } from "@/lib/mock/currencies"
import { useSiteCurrency } from "@/hooks/use-site-currency"

/** Header control for the site-wide display currency. Choice persists via
 * useSiteCurrency; selection uses a vertical ButtonGroup. Separate from the
 * top-nav converter. */
export function SiteCurrency({ className }: { className?: string }) {
  const [currency, setCurrency] = useSiteCurrency()
  const active = getCurrency(currency) ?? CURRENCIES[0]

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Site display currency"
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-(--button-radius) border border-border bg-input/30 px-2.5 text-sm text-foreground transition-colors hover:bg-input/50 aria-expanded:bg-muted dark:hover:bg-input/50",
          className
        )}
      >
        <span className="text-base leading-none">{active.flag}</span>
        <span className="font-medium">{active.code}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="size-3.5 text-muted-foreground"
        />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 gap-3">
        <div className="space-y-1">
          <div className="font-medium">Display currency</div>
          <p className="text-xs text-muted-foreground">
            Amounts across the site are shown in this currency.
          </p>
        </div>

        <ButtonGroup orientation="vertical" className="w-full">
          {CURRENCIES.map((c) => {
            const isActive = c.code === currency
            return (
              <Button
                key={c.code}
                variant="outline"
                aria-pressed={isActive}
                onClick={() => setCurrency(c.code)}
                className={cn(
                  "justify-start gap-2",
                  isActive && "bg-muted font-medium"
                )}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span className="w-10 text-left font-medium">{c.code}</span>
                <span className="truncate font-normal text-muted-foreground">
                  {c.name}
                </span>
                {isActive && (
                  <HugeiconsIcon icon={Tick02Icon} className="ml-auto size-4" />
                )}
              </Button>
            )
          })}
        </ButtonGroup>
      </PopoverContent>
    </Popover>
  )
}
