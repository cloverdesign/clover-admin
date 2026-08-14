"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  Call02Icon,
  Add01Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  Archive02Icon,
  Delete02Icon,
  UserCheck01Icon,
  Mail02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { convert } from "@/lib/mock/currencies"
import { formatMoney, CLIENT_STATUS_LABEL } from "@/lib/mock/clients"
import { useSiteCurrency } from "@/hooks/use-site-currency"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
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
import { useClient, useDeleteClient, useUpdateClient, useSendPortalInvite } from "@/lib/queries/clients-queries"
import { useProjects } from "@/lib/queries/projects-queries"
import type { Client } from "@/lib/api/models"
import { Monogram, ClientStatusBadge } from "@/components/admin/clients/atoms"

/**
 * Client detail — reads the client from the API and composes its projects +
 * rollups from the projects list. Shared by the desktop side panel and the full
 * page. Delete / status-change / portal-invite are real mutations.
 */
export function ClientDetail({ id }: { id: string }) {
  const clientQ = useClient(id)

  if (clientQ.isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
      </div>
    )
  }
  if (clientQ.isError || !clientQ.data) {
    return <div className="p-6 text-sm text-muted-foreground">Client not found.</div>
  }
  return <ClientDetailInner client={clientQ.data} />
}

function ClientDetailInner({ client }: { client: Client }) {
  const [display] = useSiteCurrency()
  const projectsQ = useProjects()
  const invite = useSendPortalInvite()

  const projects = (projectsQ.data ?? []).filter((p) => p.clientId === client.id)
  const active = projects.filter(
    (p) => !p.archived && p.status !== "COMPLETED" && p.status !== "CANCELLED"
  ).length
  const pipeline = projects.reduce(
    (s, p) => s + convert(p.totalValue, p.currency, display),
    0
  )

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
              Client since {formatDate(client.createdAt, "month")}
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
        <Contact icon={Mail01Icon} value={client.email} label="email" />
        {client.phone && <Contact icon={Call02Icon} value={client.phone} label="phone" />}
      </div>

      {/* Portal access */}
      <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <HugeiconsIcon icon={UserCheck01Icon} className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">Client portal</div>
          <div className="truncate text-xs text-muted-foreground">
            Signs in with {client.email}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={invite.isPending}
          onClick={() => invite.mutate(client.id)}
        >
          <HugeiconsIcon icon={Mail02Icon} data-icon="inline-start" className="size-3.5" />
          {invite.isPending ? "Sending…" : "Send invite"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Active projects" value={String(active)} />
        <Stat label="Pipeline value" value={formatMoney(pipeline, display)} />
      </div>

      {/* Notes */}
      {client.notes && (
        <section>
          <SectionLabel>Notes</SectionLabel>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{client.notes}</p>
        </section>
      )}

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
        {projects.length ? (
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatMoney(p.totalValue, p.currency)}
                  </div>
                </div>
                <Badge variant="secondary">{p.phase}</Badge>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No projects yet — prospect.
          </div>
        )}
      </section>
    </div>
  )
}

function Contact({
  icon,
  value,
  label,
}: {
  icon: typeof Mail01Icon
  value: string
  label?: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
      <HugeiconsIcon icon={icon} className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{value}</span>
      <CopyButton value={value} label={label ?? "value"} className="ml-auto" />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-base font-semibold">{value}</div>
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

/** Edit / status-toggle / delete — real mutations. */
function ClientActions({ client }: { client: Client }) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const del = useDeleteClient()
  const update = useUpdateClient()
  const churned = client.status === "CHURNED"

  const toggleChurned = () => {
    update.mutate({
      id: client.id,
      input: {
        name: client.name,
        email: client.email,
        company: client.company,
        phone: client.phone ?? undefined,
        notes: client.notes ?? undefined,
        status: churned ? "ACTIVE" : "CHURNED",
      },
    })
  }

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
          <DropdownMenuItem onClick={() => router.push(`/admin/clients/${client.id}/edit`)}>
            <HugeiconsIcon icon={PencilEdit02Icon} />
            Edit client
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleChurned}>
            <HugeiconsIcon icon={Archive02Icon} />
            {churned ? "Mark active" : "Mark churned"}
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
              onClick={() =>
                del.mutate(client.id, {
                  onSuccess: () => {
                    setConfirmOpen(false)
                    router.push("/admin/clients")
                  },
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
