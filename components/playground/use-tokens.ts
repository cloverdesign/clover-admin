"use client"

import * as React from "react"

/**
 * Reads computed CSS custom properties off <html> and re-reads whenever the
 * theme (class) or any inline override (style) changes — so foundation
 * specimens stay in sync with the tweak panel once it lands in step ⑤.
 */
export function useComputedTokens(names: readonly string[]) {
  const key = names.join(",")
  const [values, setValues] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const list = key ? key.split(",") : []
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      const next: Record<string, string> = {}
      for (const name of list) {
        next[name] = cs.getPropertyValue(name).trim()
      }
      setValues(next)
    }

    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })
    return () => observer.disconnect()
  }, [key])

  return values
}
