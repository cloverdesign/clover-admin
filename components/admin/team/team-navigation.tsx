"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function TeamNavigation() {
  const pathname = usePathname()
  return (
    <nav aria-label="Team settings" className="flex gap-6 border-b">
      {[
        { href: "/admin/team", label: "Members" },
        { href: "/admin/team/roles", label: "Roles & permissions" },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className={cn(
            "border-b-2 px-0.5 pb-3 text-sm transition-colors hover:text-foreground",
            pathname === item.href
              ? "border-primary font-medium text-foreground"
              : "border-transparent text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
