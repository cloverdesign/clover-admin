"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  Call02Icon,
  Location01Icon,
  Add01Icon,
  Invoice01Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  Archive02Icon,
  Delete02Icon,
  UserCheck01Icon,
  Mail02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import { PhaseBadge } from "@/components/admin/dashboard/atoms"
import {
  getClient,
  activeProjectCount,
  formatMoney,
  portalStatus,
  PORTAL_LABEL,
  type Client,
} from "@/lib/mock/clients"
import { Badge } from "@/components/ui/badge"
import {
  Monogram,
  ClientStatusBadge,
  useDisplayMoney,
} from "@/components/admin/clients/atoms"
import { useClientForm } from "@/components/admin/clients/client-form"

/**
 * Client detail content — shared by the desktop side panel (intercepted route)
 * and the full mobile/refresh page, so both stay identical. Pure content: the
 * wrappers own width, scroll, and the close/back affordance.
 */
export function ClientDetail({ id }: { id: string }) {
  const money = useDisplayMoney()
  const client = getClient(id)

  if (!client) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Client not found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Monogram company={client.company} className="size-12 rounded-xl text-sm" />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight">
              {client.company}
            </h2>
            <div className="mt-0.5 text-sm text-muted-foreground">
              Client since {client.since}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ClientStatusBadge status={client.status} />
          <ClientActions client={client} />
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Contact icon={Mail01Icon} value={client.email} />
        {client.phone && <Contact icon={Call02Icon} value={client.phone} />}
        {client.location && <Contact icon={Location01Icon} value={client.location} />}
      </div>

      {/* Portal access */}
      <PortalAccess client={client} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total value" value={money.total(client)} />
        <Stat label="Active projects" value={String(activeProjectCount(client))} />
        <Stat
          label="Outstanding"
          value={
            client.outstanding > 0
              ? formatMoney(client.outstanding, client.currency)
              : "—"
          }
          tone={client.outstanding > 0 ? "warning" : undefined}
        />
      </div>

      {/* Projects */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <SectionLabel>Projects</SectionLabel>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            render={<Link href={`/admin/clients/new-project?client=${client.id}`} />}
          >
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-3.5" />
            New project
          </Button>
        </div>
        {client.projects.length ? (
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {client.projects.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatMoney(p.value, p.currency)}
                    {p.status === "completed" ? " · Completed" : ""}
                  </div>
                </div>
                <PhaseBadge phase={p.phase} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No projects yet — prospect.
          </div>
        )}
      </section>

      {/* Invoices */}
      <section>
        <SectionLabel>Invoices</SectionLabel>
        <Link
          href="/admin/invoices"
          className="mt-2 flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/40"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <HugeiconsIcon icon={Invoice01Icon} className="size-4" />
          </span>
          <div className="min-w-0 flex-1 text-sm">
            {client.openInvoices > 0
              ? `${client.openInvoices} open invoice${client.openInvoices > 1 ? "s" : ""}`
              : "No open invoices"}
          </div>
          {client.outstanding > 0 && (
            <span className="font-mono text-sm text-warning">
              {formatMoney(client.outstanding, client.currency)}
            </span>
          )}
        </Link>
      </section>
    </div>
  )
}

function Contact({ icon, value }: { icon: typeof Mail01Icon; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
      <HugeiconsIcon icon={icon} className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{value}</span>
    </div>
  )
}

/** Portal access state + send/resend the passwordless portal invite (§1.1,
 * §1.5). Dummy — sending confirms with a toast, no real email. */
function PortalAccess({ client }: { client: Client }) {
  const status = portalStatus(client)
  const invited = status !== "not-invited"
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          status === "active"
            ? "bg-success/10 text-success"
            : "bg-muted text-muted-foreground"
        )}
      >
        <HugeiconsIcon icon={UserCheck01Icon} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          Client portal
          <Badge variant={status === "active" ? "success" : "secondary"}>
            {PORTAL_LABEL[status]}
          </Badge>
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {invited ? `Signs in with ${client.email}` : "Not yet invited to the portal"}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() =>
          toast.success(
            `${invited ? "Resent" : "Sent"} portal invite to ${client.email}`
          )
        }
      >
        <HugeiconsIcon icon={Mail02Icon} data-icon="inline-start" className="size-3.5" />
        {invited ? "Resend invite" : "Send invite"}
      </Button>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "warning"
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-base font-semibold", tone === "warning" && "text-warning")}>
        {value}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
      {children}
    </div>
  )
}

/** Edit / Archive / Delete for a client. No backend yet — actions confirm with
 * a toast (delete also returns to the list). */
function ClientActions({ client }: { client: Client }) {
  const router = useRouter()
  const { openEdit } = useClientForm()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const archived = client.status === "archived"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Client actions"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openEdit(client)}>
            <HugeiconsIcon icon={PencilEdit02Icon} />
            Edit client
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              toast.success(
                `${archived ? "Unarchived" : "Archived"} ${client.company}`
              )
            }
          >
            <HugeiconsIcon icon={Archive02Icon} />
            {archived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <HugeiconsIcon icon={Delete02Icon} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {client.company}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the client and its projects from the admin panel.
              This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false)
                toast.success(`Deleted ${client.company}`)
                router.push("/admin/clients")
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
