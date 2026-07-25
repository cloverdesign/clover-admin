import * as React from "react"

/**
 * The currency amounts are displayed in across the site. Persisted to
 * localStorage and synced across hook instances / tabs, so any future component
 * (invoices, project values) can read the same preference. No API yet.
 */
const KEY = "clover:site-currency"
const DEFAULT = "USD"
const EVENT = "clover:site-currency-change"

export function useSiteCurrency(): [string, (code: string) => void] {
  const [currency, setCurrencyState] = React.useState(DEFAULT)

  React.useEffect(() => {
    const read = () => {
      try {
        const v = window.localStorage.getItem(KEY)
        if (v) setCurrencyState(v)
      } catch {
        /* ignore */
      }
    }
    read()
    window.addEventListener(EVENT, read)
    window.addEventListener("storage", read)
    return () => {
      window.removeEventListener(EVENT, read)
      window.removeEventListener("storage", read)
    }
  }, [])

  const setCurrency = React.useCallback((code: string) => {
    setCurrencyState(code)
    try {
      window.localStorage.setItem(KEY, code)
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])

  return [currency, setCurrency]
}
