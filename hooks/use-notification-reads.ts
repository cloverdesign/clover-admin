import * as React from "react"

/**
 * Per-device read/seen state for notifications. There's no server read-flag, so
 * "which notifications has this admin already seen" is persisted to localStorage
 * and synced across hook instances and tabs — the same pattern as
 * use-site-currency. Stores the set of read notification ids.
 */
const KEY = "clover:notifications-read"
const EVENT = "clover:notifications-read-change"

function load(): Set<string> {
  try {
    const raw = window.localStorage.getItem(KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function useNotificationReads() {
  const [readIds, setReadIds] = React.useState<Set<string>>(() => new Set())

  React.useEffect(() => {
    const read = () => setReadIds(load())
    read()
    window.addEventListener(EVENT, read)
    window.addEventListener("storage", read)
    return () => {
      window.removeEventListener(EVENT, read)
      window.removeEventListener("storage", read)
    }
  }, [])

  const persist = React.useCallback((next: Set<string>) => {
    setReadIds(next)
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...next]))
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])

  const markRead = React.useCallback(
    (id: string) => {
      setReadIds((prev) => {
        if (prev.has(id)) return prev
        const next = new Set(prev).add(id)
        try {
          window.localStorage.setItem(KEY, JSON.stringify([...next]))
        } catch {
          /* ignore */
        }
        window.dispatchEvent(new Event(EVENT))
        return next
      })
    },
    []
  )

  /** Mark a batch (the currently-shown notifications) as read. */
  const markAllRead = React.useCallback(
    (ids: string[]) => persist(new Set([...load(), ...ids])),
    [persist]
  )

  return { readIds, markRead, markAllRead }
}
