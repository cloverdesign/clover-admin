"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Exchange01Icon,
  ArrowDataTransferVerticalIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURRENCIES, convert, getCurrency } from "@/lib/mock/currencies"
import { useRates } from "@/lib/queries/rates-queries"

function CurrencySelect({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (code: string) => void
  label: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(String(v))}>
      <SelectTrigger aria-label={label} className="w-[7.25rem] shrink-0">
        <SelectValue>
          {(code) => {
            const c = getCurrency(String(code))
            return (
              <span>
                {c?.flag} {c?.code}
              </span>
            )
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span>{c.flag}</span>
            <span className="font-medium">{c.code}</span>
            <span className="text-muted-foreground">{c.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Top-nav currency converter. Static placeholder rates (see lib/mock/currencies);
 * no live API yet. */
export function CurrencyConverter({ className }: { className?: string }) {
  const [amount, setAmount] = React.useState("1000")
  const [from, setFrom] = React.useState("USD")
  const [to, setTo] = React.useState("EUR")

  // Keeps the popover reactive to freshly-fetched rates (convert() reads them).
  const { data: fx } = useRates()

  const amt = parseFloat(amount) || 0
  const result = convert(amt, from, to)

  const money = (v: number, code: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(v)

  function swap() {
    setFrom(to)
    setTo(from)
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Currency converter"
        className={cn(
          "flex size-9 items-center justify-center rounded-(--button-radius) border border-border bg-input/30 text-muted-foreground transition-colors hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-input/50",
          className
        )}
      >
        <HugeiconsIcon icon={Exchange01Icon} className="size-5" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 gap-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Currency converter</div>
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            {fx ? "Live" : "Indicative"}
          </span>
        </div>

        {/* Amount + from */}
        <div className="space-y-1.5">
          <span className="px-1 font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
            Amount
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^0-9.]/g, ""))
              }
              aria-label="Amount to convert"
              className="h-9 w-full min-w-0 rounded-(--input-radius) border border-input bg-background px-3 text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <CurrencySelect value={from} onChange={setFrom} label="From currency" />
          </div>
        </div>

        {/* Swap */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <button
            type="button"
            onClick={swap}
            aria-label="Swap currencies"
            className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowDataTransferVerticalIcon} className="size-4" />
          </button>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Result + to */}
        <div className="space-y-1.5">
          <span className="px-1 font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
            Converts to
          </span>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-full min-w-0 items-center overflow-hidden rounded-(--input-radius) bg-muted px-3 text-sm font-semibold tabular-nums">
              {money(result, to)}
            </div>
            <CurrencySelect value={to} onChange={setTo} label="To currency" />
          </div>
        </div>

        {/* Rates reference — every currency against 1 unit of `from`. */}
        <div className="space-y-1.5">
          <span className="px-1 font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
            Rates · 1 {from}
          </span>
          <div className="divide-y divide-border/60 overflow-hidden rounded-(--input-radius) border border-border">
            {CURRENCIES.filter((c) => c.code !== from).map((c) => (
              <div
                key={c.code}
                className="flex items-center gap-2 px-3 py-1.5 text-sm"
              >
                <span>{c.flag}</span>
                <span className="font-medium">{c.code}</span>
                <span className="ml-auto tabular-nums">
                  {convert(1, from, c.code).toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {fx
            ? `Live · updated ${new Date(fx.updatedAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })} · `
            : "Indicative rates · "}
          rates by{" "}
          <a
            href="https://www.exchangerate-api.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            exchangerate-api.com
          </a>
        </p>
      </PopoverContent>
    </Popover>
  )
}
