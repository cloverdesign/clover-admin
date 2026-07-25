/**
 * Currencies + PLACEHOLDER exchange rates for the top-nav converter.
 *
 * ⚠️ Rates are static and NOT live — do not trust for real quoting. Replace
 * `USD_RATES` with a rates API later (we'll design that consumption separately).
 * Currency is a first-class PRD concept (project + invoice currency, §1.3).
 */

export type Currency = {
  code: string
  name: string
  symbol: string
  flag: string
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "$", flag: "🇦🇺" },
]

/** Units of each currency per 1 USD. PLACEHOLDER — swap for live rates. */
export const USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1580,
  CAD: 1.37,
  AUD: 1.52,
}

export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code)
}

/** Convert via USD as the pivot. Returns 0 for unknown codes. */
export function convert(amount: number, from: string, to: string): number {
  const f = USD_RATES[from]
  const t = USD_RATES[to]
  if (!f || !t || !Number.isFinite(amount)) return 0
  return (amount / f) * t
}
