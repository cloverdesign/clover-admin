"use client"

/**
 * Project admin assignment. `AssignAdmins` is the interactive widget (removable
 * chips + an add picker) used in the edit form; `AssignedTeam` is the read-only
 * avatar list shown on the project detail page. Both read the assigned list off
 * the project (kept fresh by the assignment mutations' cache patch). Writes go
 * through the per-admin endpoints and save immediately — there is no bulk save.
 */

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Cancel01Icon,
  Tick02Icon,
  UnfoldMoreIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  useAssignAdmin,
  useUnassignAdmin,
} from "@/lib/queries/projects-queries"
import { useAdmins } from "@/lib/queries/admins-queries"
import type { Admin, Project } from "@/lib/api/models"

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")
}

function AdminAvatar({ admin, className }: { admin: Admin; className?: string }) {
  return (
    <Avatar className={className ?? "size-6 rounded-full"}>
      <AvatarFallback className="bg-primary text-[10px] font-medium text-primary-foreground">
        {initials(admin.name)}
      </AvatarFallback>
    </Avatar>
  )
}

/* ------------------------------------------------------------ interactive */

export function AssignAdmins({ project }: { project: Project }) {
  const assigned = project.assignedAdmins ?? []
  const assign = useAssignAdmin()
  const unassign = useUnassignAdmin()
  const busy = assign.isPending || unassign.isPending

  return (
    <div className="flex flex-wrap items-center gap-2">
      {assigned.map((a) => (
        <span
          key={a.id}
          className="flex items-center gap-1.5 rounded-full border bg-card py-1 pl-1 pr-2 text-sm"
        >
          <AdminAvatar admin={a} className="size-5 rounded-full" />
          <span className="max-w-40 truncate">{a.name}</span>
          <button
            type="button"
            aria-label={`Remove ${a.name}`}
            disabled={busy}
            onClick={() =>
              unassign.mutate({ projectId: project.id, adminId: a.id })
            }
            className="flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
          </button>
        </span>
      ))}
      <AddAdmin
        assigned={assigned}
        disabled={busy}
        onAdd={(adminId) => assign.mutate({ projectId: project.id, adminId })}
      />
    </div>
  )
}

function AddAdmin({
  assigned,
  disabled,
  onAdd,
}: {
  assigned: Admin[]
  disabled: boolean
  onAdd: (adminId: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const adminsQ = useAdmins()

  const assignedIds = new Set(assigned.map((a) => a.id))
  // Only approved admins can hold a resource; don't offer the already-assigned.
  const options = (adminsQ.data ?? []).filter(
    (a) => a.approved && !assignedIds.has(a.id)
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className="flex h-7 items-center gap-1.5 rounded-full border border-dashed px-3 text-sm text-muted-foreground transition-colors hover:border-ring/60 hover:text-foreground aria-expanded:border-ring/60 disabled:opacity-50"
      >
        <HugeiconsIcon icon={Add01Icon} className="size-4" />
        Assign admin
        <HugeiconsIcon icon={UnfoldMoreIcon} className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search admins…" />
          <CommandList>
            <CommandEmpty>
              {adminsQ.isLoading ? "Loading admins…" : "No admins to add."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((a) => (
                <CommandItem
                  key={a.id}
                  value={`${a.name} ${a.email}`}
                  onSelect={() => {
                    onAdd(a.id)
                    setOpen(false)
                  }}
                  className="gap-2"
                >
                  <AdminAvatar admin={a} className="size-6 rounded-full" />
                  <span className="min-w-0 flex-1">
                    <span className="truncate">{a.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {a.email}
                    </span>
                  </span>
                  {a.role === "SUPER_ADMIN" && (
                    <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      Super
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/* -------------------------------------------------------------- read-only */

export function AssignedTeam({ project }: { project: Project }) {
  const assigned = project.assignedAdmins ?? []

  if (assigned.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed bg-card p-3 text-sm text-muted-foreground">
        <HugeiconsIcon icon={UserGroupIcon} className="size-4" />
        No admins assigned yet.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {assigned.map((a) => (
        <span
          key={a.id}
          className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 text-sm"
        >
          <AdminAvatar admin={a} className="size-6 rounded-full" />
          <span className="min-w-0">
            <span className="block max-w-48 truncate leading-tight">{a.name}</span>
            <span className="block max-w-48 truncate text-xs leading-tight text-muted-foreground">
              {a.email}
            </span>
          </span>
          {a.role === "SUPER_ADMIN" && (
            <HugeiconsIcon
              icon={Tick02Icon}
              className="size-3.5 text-muted-foreground"
            />
          )}
        </span>
      ))}
    </div>
  )
}
