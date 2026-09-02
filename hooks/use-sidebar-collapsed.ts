"use client"

import * as React from "react"

/**
 * Whether a shell's sidebar is collapsed to its icon rail, persisted per shell.
 *
 * Backed by a module-level store rather than component state so the value
 * survives navigation, and read through `useSyncExternalStore` so the server
 * and the first client render agree without a `useState` + `useEffect` pair
 * (which the repo's `react-hooks/set-state-in-effect` rule rejects, and which
 * would flash the expanded rail on every load).
 *
 * Admin and portal keep separate keys: a client collapsing their portal has no
 * business changing the studio's admin layout, and in local development both
 * live on the same origin.
 */
export type SidebarScope = "admin" | "portal"

const STORAGE_KEY: Record<SidebarScope, string> = {
  admin: "clover.admin.sidebar-collapsed",
  portal: "clover.portal.sidebar-collapsed",
}

/** null until first read on the client — localStorage isn't available on the
 * server, and reading it lazily keeps the server snapshot honest. */
const cache: Record<SidebarScope, boolean | null> = {
  admin: null,
  portal: null,
}

const listeners: Record<SidebarScope, Set<() => void>> = {
  admin: new Set(),
  portal: new Set(),
}

function read(scope: SidebarScope): boolean {
  if (cache[scope] === null) {
    try {
      cache[scope] = window.localStorage.getItem(STORAGE_KEY[scope]) === "1"
    } catch {
      // Private mode, or storage blocked — default to expanded.
      cache[scope] = false
    }
  }
  return cache[scope] as boolean
}

function write(scope: SidebarScope, next: boolean): void {
  cache[scope] = next
  try {
    window.localStorage.setItem(STORAGE_KEY[scope], next ? "1" : "0")
  } catch {
    // Not persisting is fine; the in-memory value still drives this session.
  }
  for (const listener of listeners[scope]) listener()
}

export function useSidebarCollapsed(
  scope: SidebarScope
): [boolean, (next: boolean) => void] {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      listeners[scope].add(onChange)
      return () => {
        listeners[scope].delete(onChange)
      }
    },
    [scope]
  )

  const collapsed = React.useSyncExternalStore(
    subscribe,
    () => read(scope),
    () => false
  )

  const setCollapsed = React.useCallback(
    (next: boolean) => write(scope, next),
    [scope]
  )

  return [collapsed, setCollapsed]
}
