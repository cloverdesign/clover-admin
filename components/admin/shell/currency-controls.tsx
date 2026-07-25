"use client"

import { ButtonGroup } from "@/components/ui/button-group"
import { SiteCurrency } from "@/components/admin/shell/site-currency"
import { CurrencyConverter } from "@/components/admin/shell/currency-converter"

/** The two currency controls joined into one connected button group so they
 * read as a single unit — the site display-currency picker + the converter. */
export function CurrencyControls({ className }: { className?: string }) {
  return (
    <ButtonGroup className={className}>
      <SiteCurrency />
      <CurrencyConverter />
    </ButtonGroup>
  )
}
