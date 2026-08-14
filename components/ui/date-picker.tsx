"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

/** Parse a "yyyy-mm-dd" value into a local Date (no timezone drift). */
function ymdToDate(value: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

/** Format a Date back to "yyyy-mm-dd" from its local parts. */
function dateToYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Custom date picker — a styled trigger + a calendar popover, replacing the
 * native `<input type="date">`. Keeps the same string contract ("yyyy-mm-dd"),
 * so callers and the `toApiDateTime` send-path are unchanged. Empty value =
 * unset; a Clear action lets optional dates be removed.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  id,
  className,
  clearable = true,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  className?: string
  clearable?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const selected = ymdToDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 font-normal",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <HugeiconsIcon icon={Calendar03Icon} className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-left">
          {value ? formatDate(value) : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => {
            if (d) {
              onChange(dateToYmd(d))
              setOpen(false)
            }
          }}
        />
        {clearable && value && (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange("")
                setOpen(false)
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
