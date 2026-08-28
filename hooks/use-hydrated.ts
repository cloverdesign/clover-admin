import * as React from "react"

/** Never fires — the value flips once, when the client takes over from SSR. */
function subscribe(): () => void {
  return () => {}
}

/**
 * `false` during SSR and the hydration pass, `true` afterwards.
 *
 * The usual way to write this is `useState(false)` plus `useEffect(() => setMounted(true))`,
 * but setting state synchronously in an effect triggers a second render pass
 * (`react-hooks/set-state-in-effect`). `useSyncExternalStore` expresses the same
 * thing as what it actually is: a value the server and client disagree about.
 *
 * Use it to gate rendering of anything that reads the browser — a resolved
 * theme, a stored token — so the server and the first client render still match.
 */
export function useHydrated(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
