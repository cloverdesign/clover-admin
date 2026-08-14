/**
 * Currencies + exchange rates.
 *
 * `USD_RATES` is the static FALLBACK/seed. At runtime `useRates` hydrates a live
 * table from ExchangeRate-API's open endpoint (units per 1 USD — same shape as
 * the seed) into a mutable cache that `convert()` reads, so every call site goes
 * live without threading rates through. Falls back to the seed if the fetch
 * fails or before it resolves. Currency is a first-class PRD concept (project +
 * invoice currency, §1.3).
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

/** Units of each currency per 1 USD — static fallback / seed for the live cache. */
export const USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1580,
  CAD: 1.37,
  AUD: 1.52,
}

/** Live rate cache (units per 1 USD). Seeded from the fallback; hydrated by
 * useRates. Merged with the seed so any missing code still resolves. */
let liveRates: Record<string, number> = { ...USD_RATES }
let ratesUpdatedAt: number | null = null

/** Replace the live cache (called by useRates on fetch / warm-start). */
export function setRates(rates: Record<string, number>, updatedAt?: number): void {
  liveRates = { ...USD_RATES, ...rates }
  ratesUpdatedAt = updatedAt ?? null
}

/** When the live rates were last updated (ms epoch), or null if still on seed. */
export function getRatesUpdatedAt(): number | null {
  return ratesUpdatedAt
}

export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code)
}

/** Convert via USD as the pivot, using the live cache. Returns 0 for unknown codes. */
export function convert(amount: number, from: string, to: string): number {
  const f = liveRates[from]
  const t = liveRates[to]
  if (!f || !t || !Number.isFinite(amount)) return 0
  return (amount / f) * t
}
