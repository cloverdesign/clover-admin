import * as React from "react"
import Image from "next/image"

import { Card } from "@/components/ui/card"
import { CloverMark } from "@/components/admin/auth/clover-mark"

/**
 * Shared chrome for every admin-auth screen: the green leaf-shadow wash, the
 * lime dot grid, and a centered card with the Clover mark + title. Each screen
 * (login, register, forgot, reset) supplies its own title/subtitle and form.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-6">
      {/* Atmospheric green wash */}
      <Image
        src="/auth-wash.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Lime dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-lime-500)_1px,transparent_1px)] bg-size-[18px_18px] opacity-70"
      />

      <Card className="relative z-10 w-full max-w-sm gap-0 p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <CloverMark className="size-9" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="mt-8">{children}</div>
      </Card>
    </div>
  )
}
