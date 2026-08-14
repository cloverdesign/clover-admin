"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  MoreHorizontalIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Delete02Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CopyButton } from "@/components/ui/copy-button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { useMe } from "@/lib/queries/auth-queries"
import {
  useAdmins,
  useApproveAdmin,
  useRevokeAdmin,
  useSetAdminRole,
  useDeleteAdmin,
} from "@/lib/queries/admins-queries"
import type { Admin } from "@/lib/api/models"

/**
 * Team — admin account management for super admins. Lists pending and active
 * admins; row actions (approve / revoke / promote / demote / delete) mirror the
 * API's guardrails (no acting on yourself; can't revoke or delete a super admin).
 */
export function TeamPage() {
  const { data: me, isLoading: meLoading } = useMe()
  const { data: admins, isLoading, isError } = useAdmins()

  if (meLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }

  if (me?.role !== "SUPER_ADMIN") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <HugeiconsIcon icon={ShieldKeyIcon} className="size-5" />
        </div>
        <p className="text-sm text-muted-foreground">
          Only super admins can manage the team.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError || !admins) {
    return (
      <p className="py-24 text-center text-sm text-muted-foreground">
        Couldn’t load admins.
      </p>
    )
  }

  const byName = (a: Admin, b: Admin) => a.name.localeCompare(b.name)
  const pending = admins.filter((a) => !a.approved).sort(byName)
  const active = admins.filter((a) => a.approved).sort(byName)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {admins.length} admin{admins.length === 1 ? "" : "s"}
          {pending.length > 0 && ` · ${pending.length} awaiting approval`}
        </p>
      </div>

      {pending.length > 0 && (
        <Section title="Pending approval">
          {pending.map((a) => (
            <AdminRow key={a.id} admin={a} meId={me.id} />
          ))}
        </Section>
      )}

      <Section title="Active">
        {active.map((a) => (
          <AdminRow key={a.id} admin={a} meId={me.id} />
        ))}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
        {title}
      </h2>
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border bg-card">
        {children}
      </div>
    </section>
  )
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")
}

function AdminRow({ admin, meId }: { admin: Admin; meId: string }) {
  const [confirm, setConfirm] = React.useState<"revoke" | "delete" | null>(null)
  const approve = useApproveAdmin()
  const revoke = useRevokeAdmin()
  const setRole = useSetAdminRole()
  const del = useDeleteAdmin()

  const isSelf = admin.id === meId
  const isSuper = admin.role === "SUPER_ADMIN"

  // Mirror the API's guardrails so we never offer an action it would reject.
  const canApprove = !admin.approved && !isSelf
  const canRevoke = admin.approved && !isSelf && !isSuper
  const canPromote = !isSuper && !isSelf
  const canDemote = isSuper && !isSelf
  const canDelete = !isSelf && !isSuper
  const hasActions = canApprove || canRevoke || canPromote || canDemote || canDelete

  return (
    <>
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <Avatar className="size-9 rounded-full">
          <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
            {initials(admin.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium">{admin.name}</span>
            {isSelf && <span className="text-xs text-muted-foreground">You</span>}
            <Badge variant={isSuper ? "info" : "secondary"}>
              {isSuper ? "Super admin" : "Admin"}
            </Badge>
            <Badge variant={admin.approved ? "success" : "warning"}>
              {admin.approved ? "Active" : "Pending"}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate">{admin.email}</span>
            <CopyButton value={admin.email} label="email" size={12} className="size-5" />
            {!admin.emailVerified && <span className="shrink-0">· Email not verified</span>}
          </div>
        </div>

        {hasActions && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions for ${admin.name}`}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canApprove && (
                <DropdownMenuItem onClick={() => approve.mutate(admin.id)}>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} />
                  Approve
                </DropdownMenuItem>
              )}
              {canPromote && (
                <DropdownMenuItem
                  onClick={() => setRole.mutate({ id: admin.id, role: "SUPER_ADMIN" })}
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} />
                  Make super admin
                </DropdownMenuItem>
              )}
              {canDemote && (
                <DropdownMenuItem
                  onClick={() => setRole.mutate({ id: admin.id, role: "ADMIN" })}
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} />
                  Demote to admin
                </DropdownMenuItem>
              )}
              {canRevoke && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setConfirm("revoke")}>
                    <HugeiconsIcon icon={Cancel01Icon} />
                    Revoke access
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && (
                <DropdownMenuItem variant="destructive" onClick={() => setConfirm("delete")}>
                  <HugeiconsIcon icon={Delete02Icon} />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "delete" ? "Delete" : "Revoke access for"} {admin.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "delete"
                ? "This permanently removes the admin account. This can’t be undone."
                : "They’ll be signed out and blocked from signing in until re-approved."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const action = confirm === "delete" ? del : revoke
                action.mutate(admin.id, { onSuccess: () => setConfirm(null) })
              }}
            >
              {confirm === "delete" ? "Delete" : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
