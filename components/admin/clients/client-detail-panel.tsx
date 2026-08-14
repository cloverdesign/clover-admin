"use client"

import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

import { ClientDetail } from "@/components/admin/clients/client-detail"

/**
 * Client-detail panel, driven by the `?c=<id>` search param. On desktop it's a
 * docked column beside the (shrunken) list; on mobile it's a full-screen layer.
 * Closing clears the param so the list returns to full width.
 */
export function ClientDetailPanel({ id }: { id: string }) {
  const router = useRouter()
  const close = () => router.push("/admin/clients", { scroll: false })

  return (
    <div
      className={
        "flex flex-col overflow-hidden bg-card " +
        // mobile: full-screen layer
        "max-md:fixed max-md:inset-0 max-md:z-40 " +
        // desktop: docked column beside the list
        "md:h-full md:w-[400px] md:shrink-0 md:rounded-2xl md:border lg:w-[440px]"
      }
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5 md:hidden" />
          <HugeiconsIcon icon={Cancel01Icon} className="hidden size-5 md:block" />
        </button>
        <span className="text-sm font-medium">Client detail</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ClientDetail id={id} />
      </div>
    </div>
  )
}
