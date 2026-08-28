import * as React from "react"

/**
 * Live match state for a CSS media query. Returns `false` on the server and for
 * the hydration pass, then the real value — so callers that need to distinguish
 * "no match" from "don't know yet" should pair it with `useHydrated`.
 *
 * `useSyncExternalStore` rather than state + effect: the match lives outside
 * React, and subscribing to it directly avoids the extra render pass that
 * setting state inside an effect causes.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query]
  )
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}
