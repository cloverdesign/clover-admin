"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"

import { CloverMark } from "@/components/admin/auth/clover-mark"
import { usePortalMe, usePortalLogout } from "@/lib/queries/portal-queries"

/**
 * Client-facing chrome: a slim top bar with the Clover mark, the signed-in
 * client's company, and sign out — over a centered content column. Deliberately
 * not the admin sidebar; the portal is a small, focused surface.
 */
export function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: client } = usePortalMe()
  const logout = usePortalLogout()

  const signOut = () =>
    logout.mutate(undefined, {
      onSettled: () => router.replace("/portal/login"),
    })

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center gap-3 px-4 sm:px-6">
          <Link href="/portal" className="flex items-center gap-2.5" aria-label="Home">
            <CloverMark className="size-6" />
            <span className="text-sm font-semibold tracking-tight">Clover</span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            {client && (
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline">
                {client.company}
              </span>
            )}
            <button
              type="button"
              aria-label="Sign out"
              onClick={signOut}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Logout01Icon} className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
