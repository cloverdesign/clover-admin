"use client"

import * as React from "react"

const STORAGE_KEY = "clover-playground-overrides"

export type OverrideState = {
  /** Token overrides: CSS var name → value. Applied live to <html>. */
  tokens: Record<string, string>
  /** Per-component knob overrides (wired in step ⑦). */
  components: Record<string, Record<string, string>>
  /** Freeform intent for Claude to honor when applying. */
  note: string
}

const EMPTY: OverrideState = { tokens: {}, components: {}, note: "" }

type OverrideContextValue = OverrideState & {
  setToken: (name: string, value: string) => void
  resetToken: (name: string) => void
  setComponent: (component: string, key: string, value: string) => void
  resetComponent: (component: string, key: string) => void
  setNote: (note: string) => void
  resetAll: () => void
  /** Count of active overrides (tokens + component knobs). */
  count: number
}

const OverrideContext = React.createContext<OverrideContextValue | null>(null)

export function useOverrides() {
  const ctx = React.useContext(OverrideContext)
  if (!ctx) throw new Error("useOverrides must be used within OverrideProvider")
  return ctx
}

export function OverrideProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<OverrideState>(EMPTY)
  const applied = React.useRef<Set<string>>(new Set())

  // Load any persisted overrides after mount (avoids SSR hydration mismatch).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) })
    } catch {
      // ignore malformed storage
    }
  }, [])

  // Persist + apply token overrides to <html> inline style. Foundation
  // specimens pick these up automatically via their style MutationObserver.
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore quota errors
    }

    const root = document.documentElement
    // Both token roles and per-component knobs are CSS vars on <html>; the
    // component knob key IS its var name (e.g. "--button-radius").
    const next = new Map<string, string>()
    for (const [key, value] of Object.entries(state.tokens)) next.set(key, value)
    for (const knobs of Object.values(state.components)) {
      for (const [key, value] of Object.entries(knobs)) next.set(key, value)
    }
    for (const key of applied.current) {
      if (!next.has(key)) root.style.removeProperty(key)
    }
    for (const [key, value] of next) root.style.setProperty(key, value)
    applied.current = new Set(next.keys())
  }, [state])

  const value = React.useMemo<OverrideContextValue>(() => {
    const count =
      Object.keys(state.tokens).length +
      Object.values(state.components).reduce(
        (sum, knobs) => sum + Object.keys(knobs).length,
        0
      )

    return {
      ...state,
      count,
      setToken: (name, v) =>
        setState((s) => ({ ...s, tokens: { ...s.tokens, [name]: v } })),
      resetToken: (name) =>
        setState((s) => {
          const tokens = { ...s.tokens }
          delete tokens[name]
          return { ...s, tokens }
        }),
      setComponent: (component, key, v) =>
        setState((s) => ({
          ...s,
          components: {
            ...s.components,
            [component]: { ...s.components[component], [key]: v },
          },
        })),
      resetComponent: (component, key) =>
        setState((s) => {
          const knobs = { ...s.components[component] }
          delete knobs[key]
          const components = { ...s.components, [component]: knobs }
          if (Object.keys(knobs).length === 0) delete components[component]
          return { ...s, components }
        }),
      setNote: (note) => setState((s) => ({ ...s, note })),
      resetAll: () => setState((s) => ({ ...EMPTY, note: s.note })),
    }
  }, [state])

  return (
    <OverrideContext.Provider value={value}>
      {children}
    </OverrideContext.Provider>
  )
}
