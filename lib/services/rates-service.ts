/**
 * Exchange-rate transport. Unlike the other services, this hits a THIRD-PARTY
 * endpoint (ExchangeRate-API's open access, no key) — not the Clover CMS API —
 * so it uses plain fetch rather than the authed apiClient. Returns rates as
 * units per 1 USD, matching the shape convert() expects. Attribution to
 * exchangerate-api.com is required by their free tier.
 */

const ENDPOINT = "https://open.er-api.com/v6/latest/USD"

export interface FxRates {
  /** Units of each currency per 1 USD. */
  rates: Record<string, number>
  /** When the provider last refreshed the rates (ms epoch). */
  updatedAt: number
}

export class RatesService {
  static async fetchUsdRates(): Promise<FxRates> {
    const res = await fetch(ENDPOINT)
    if (!res.ok) throw new Error(`Rates request failed (${res.status})`)
    const json = await res.json()
    if (json?.result !== "success" || !json?.rates) {
      throw new Error("Rates response was not successful")
    }
    return {
      rates: json.rates as Record<string, number>,
      updatedAt: (json.time_last_update_unix ?? 0) * 1000,
    }
  }
}
