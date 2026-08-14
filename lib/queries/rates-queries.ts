/**
 * Live exchange rates. Fetches units-per-USD from ExchangeRate-API once every
 * 12h and pushes them into the convert() cache, so every money conversion in
 * the app goes live. Two layers of resilience:
 *
 * - warm-start from localStorage on mount, so repeat visits convert with the
 *   last-known live rates before the network resolves;
 * - silent + falls back to the static seed if the fetch ever fails (the cache
 *   simply keeps whatever it last had).
 *
 * Mount once high in the tree (AdminShell); the converter also calls it so its
 * popover is reactive to fresh rates.
 */

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { RatesService, type FxRates } from "@/lib/services/rates-service"
import { setRates } from "@/lib/mock/currencies"

const STORAGE_KEY = "clover:fx-rates"

function warmStartFromStorage(): void {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const stored = JSON.parse(raw) as FxRates
    if (stored?.rates) setRates(stored.rates, stored.updatedAt)
  } catch {
    /* ignore */
  }
}

export function useRates() {
  React.useEffect(() => warmStartFromStorage(), [])

  return useQuery({
    queryKey: queryKeys.rates.usd,
    queryFn: async () => {
      const data = await RatesService.fetchUsdRates()
      // Update the convert() cache before the query commits, so any subscriber
      // that re-renders on this data already reads the fresh rates.
      setRates(data.rates, data.updatedAt)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        /* ignore */
      }
      return data
    },
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    meta: { silent: true as const },
  })
}
