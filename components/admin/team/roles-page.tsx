"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ShieldKeyIcon,
  Search01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"
import { useMe } from "@/lib/queries/auth-queries"
import { useAdmins } from "@/lib/queries/admins-queries"
import { isSuperAdmin } from "@/lib/access"
import {
  INITIAL_ROLES,
  PERMISSIONS,
  PERMISSION_GROUPS,
  loadRoleDrafts,
  roleChanges,
  togglePermission,
  type Permission,
  type RoleDraft,
} from "@/lib/role-drafts"
import { TeamNavigation } from "@/components/admin/team/team-navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export function RolesPage() {
  const hydrated = useHydrated()
  const { data: me } = useMe()
  if (!hydrated || !me)
    return <p className="p-6 text-sm text-muted-foreground">Loading roles…</p>
  if (!isSuperAdmin(me))
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Only super admins can manage roles.
      </p>
    )
  return (
    <RolesEditor key={me.id} storageKey={`clover.role-drafts.v1.${me.id}`} />
  )
}

function RolesEditor({ storageKey }: { storageKey: string }) {
  const [saved, setSaved] = React.useState(() => loadRoleDrafts(storageKey))
  const [roles, setRoles] = React.useState(saved)
  const [selectedId, setSelectedId] = React.useState("ADMIN")
  const [search, setSearch] = React.useState("")
  const [review, setReview] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [template, setTemplate] = React.useState("ADMIN")
  const [savedMessage, setSavedMessage] = React.useState("")
  const { data: admins } = useAdmins()
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0]
  const original = saved.find((r) => r.id === selected.id)
  const locked = selected.id === "SUPER_ADMIN"
  const changes = original
    ? roleChanges(original, selected)
    : [
        "Create custom role",
        ...selected.permissions.map(
          (id) => `Allow: ${PERMISSIONS.find((p) => p.id === id)?.label}`
        ),
      ]
  const dirty = !original || changes.length > 0
  const duplicate = roles.some(
    (r) =>
      r.id !== selected.id &&
      r.name.trim().toLowerCase() === selected.name.trim().toLowerCase()
  )
  const valid = selected.name.trim().length > 0 && !duplicate
  const sensitive = PERMISSIONS.filter(
    (p) => p.sensitive && selected.permissions.includes(p.id)
  ).length
  const currentMembers = admins?.filter(
    (a) => a.role === selected.id && a.approved
  ).length
  const groups = PERMISSION_GROUPS.map((g) => ({
    ...g,
    permissions: (g.permissions as readonly Permission[]).filter((p) =>
      `${g.title} ${p.label} ${p.description}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ),
  })).filter((g) => g.permissions.length)

  function update(patch: Partial<RoleDraft>) {
    if (locked) return
    setSavedMessage("")
    setRoles((all) =>
      all.map((r) => (r.id === selected.id ? { ...r, ...patch } : r))
    )
  }

  function save() {
    if (!valid || locked) return
    const next = original
      ? saved.map((r) => (r.id === selected.id ? selected : r))
      : [...saved, selected]
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      setSaved(next)
      setReview(false)
      setSavedMessage("Draft saved in this browser. Live access is unchanged.")
      toast.success("Role draft saved")
    } catch {
      toast.error(
        "Couldn’t save this draft. Browser storage may be unavailable."
      )
    }
  }

  function discard() {
    if (original)
      setRoles((all) => all.map((r) => (r.id === selected.id ? original : r)))
    else {
      setRoles((all) => all.filter((r) => r.id !== selected.id))
      setSelectedId("ADMIN")
    }
    setSavedMessage("")
  }

  function create() {
    const name = newName.trim()
    if (!name || roles.some((r) => r.name.toLowerCase() === name.toLowerCase()))
      return
    const base = roles.find((r) => r.id === template) ?? INITIAL_ROLES[1]
    const role: RoleDraft = {
      ...base,
      id: crypto.randomUUID(),
      name,
      description: "",
      system: false,
      permissions: [...base.permissions],
    }
    setRoles((all) => [...all, role])
    setSelectedId(role.id)
    setSearch("")
    setCreating(false)
    setSavedMessage("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The right access for everyone who works with Clover.
          </p>
        </div>
        <Button
          onClick={() => {
            setNewName("")
            setTemplate(selected.id)
            setCreating(true)
          }}
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Create role
        </Button>
      </div>
      <TeamNavigation />
      <div className="flex items-start gap-3 rounded-xl border border-dashed bg-muted/30 px-4 py-3">
        <Badge variant="secondary" className="mt-0.5 shrink-0">
          Draft workspace
        </Badge>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Design roles before putting them into use. Saved drafts stay in this
          browser; members keep their current access.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[228px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-0">
          <div className="mb-3 flex items-center justify-between px-2">
            <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Roles
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {roles.length}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {roles.map((r) => {
              const baseline = saved.find((s) => s.id === r.id)
              const changed = !baseline || roleChanges(baseline, r).length > 0
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedId(r.id)
                    setSearch("")
                    setSavedMessage("")
                  }}
                  aria-pressed={selected.id === r.id}
                  className={cn(
                    "min-w-48 rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:min-w-0",
                    selected.id === r.id
                      ? "border-primary/25 bg-primary/5"
                      : "border-transparent hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={ShieldKeyIcon}
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {r.name || "Untitled role"}
                    </span>
                    {changed && (
                      <span
                        className="size-1.5 rounded-full bg-warning"
                        aria-label="Unsaved changes"
                      />
                    )}
                  </div>
                  <div className="mt-1.5 pl-6 text-xs text-muted-foreground">
                    {r.id === "SUPER_ADMIN"
                      ? "Full access · protected"
                      : `${r.permissions.length} permissions · ${r.scope === "assigned" ? "assigned" : "all"} projects`}
                  </div>
                </button>
              )
            })}
          </div>
          <p className="mt-5 hidden px-2 text-xs leading-relaxed text-muted-foreground lg:block">
            Start with Admin for contributors. Add access only where their work
            needs it.
          </p>
        </aside>

        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="border-b p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <HugeiconsIcon icon={ShieldKeyIcon} className="size-5" />
                </span>
                <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">
                  {selected.name || "Untitled role"}
                </h2>
                <Badge variant="secondary">
                  {locked
                    ? "Protected role"
                    : selected.system
                      ? "Built-in role draft"
                      : "Custom role draft"}
                </Badge>
              </div>
              {locked ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Super admins have full access to Clover. This role cannot be
                  edited. Duplicate it to design a role with fewer permissions.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="role-name" className="text-xs font-medium">
                      Role name
                    </label>
                    <Input
                      id="role-name"
                      value={selected.name}
                      maxLength={60}
                      onChange={(e) => update({ name: e.target.value })}
                      aria-invalid={duplicate}
                    />
                    {duplicate && (
                      <p className="text-xs text-destructive">
                        A role with this name already exists.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="role-description"
                      className="text-xs font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      id="role-description"
                      rows={2}
                      className="min-h-16 resize-none"
                      placeholder="Who is this role for?"
                      value={selected.description}
                      maxLength={240}
                      onChange={(e) => update({ description: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span>
                  <strong className="font-medium text-foreground">
                    {selected.permissions.length}
                  </strong>{" "}
                  permissions allowed
                </span>
                <span>
                  <strong className="font-medium text-foreground">
                    {sensitive}
                  </strong>{" "}
                  sensitive permissions
                </span>
                <span>
                  {selected.system
                    ? `${currentMembers ?? "—"} current members`
                    : "Not assigned to members"}
                </span>
              </div>
            </div>

            <fieldset disabled={locked} className="border-b p-5 sm:p-6">
              <legend className="sr-only">Project access</legend>
              <h3 className="text-sm font-semibold">
                Which projects can this role access?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Project permissions below apply within this scope.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      value: "assigned",
                      title: "Assigned projects",
                      body: "Only projects they’ve been added to.",
                    },
                    {
                      value: "all",
                      title: "All projects",
                      body: "Every project in the workspace.",
                    },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5",
                      selected.scope === option.value
                        ? "border-primary/30 bg-primary/5"
                        : "border-border",
                      locked && "cursor-default"
                    )}
                  >
                    <input
                      type="radio"
                      name="project-scope"
                      value={option.value}
                      checked={selected.scope === option.value}
                      onChange={() => update({ scope: option.value })}
                      className="mt-0.5 size-4 accent-primary"
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {option.body}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
              <h3 className="text-sm font-semibold">Permissions</h3>
              <div className="relative w-full sm:w-64">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  aria-label="Search permissions"
                  placeholder="Find a permission…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="px-5 sm:px-6">
              {groups.map((group) => (
                <section
                  key={group.id}
                  className="border-b py-5 last:border-0"
                  aria-labelledby={`group-${group.id}`}
                >
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <h4
                        id={`group-${group.id}`}
                        className="text-sm font-semibold"
                      >
                        {group.title}
                      </h4>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {
                          group.permissions.filter((p) =>
                            selected.permissions.includes(p.id)
                          ).length
                        }
                        /{group.permissions.length}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                  {group.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between gap-5 py-3"
                    >
                      <div className="min-w-0">
                        <label
                          htmlFor={`permission-${permission.id}`}
                          className="flex cursor-pointer flex-wrap items-center gap-2 text-sm font-medium"
                        >
                          {permission.label}
                          {permission.sensitive && (
                            <span
                              aria-hidden="true"
                              className="rounded-md bg-warning/10 px-1.5 py-0.5 text-[10px] font-normal text-warning"
                            >
                              Sensitive
                            </span>
                          )}
                        </label>
                        <p
                          id={`help-${permission.id}`}
                          className="mt-1 text-xs leading-relaxed text-muted-foreground"
                        >
                          {permission.description}
                        </p>
                      </div>
                      <Switch
                        id={`permission-${permission.id}`}
                        aria-label={permission.label}
                        aria-describedby={`help-${permission.id}`}
                        disabled={locked}
                        checked={selected.permissions.includes(permission.id)}
                        onCheckedChange={(checked) =>
                          update({
                            permissions: togglePermission(
                              selected.permissions,
                              permission.id,
                              checked
                            ),
                          })
                        }
                      />
                    </div>
                  ))}
                </section>
              ))}
              {!groups.length && (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No permissions match “{search}”.
                </p>
              )}
            </div>
          </div>
          <p className="px-1 py-3 text-xs leading-relaxed text-muted-foreground">
            Editing permissions includes their required viewing access. Removing
            viewing access also removes actions that depend on it.
          </p>
          <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 px-4 py-3 shadow-sm backdrop-blur-sm">
            <div
              className="min-w-0 text-xs text-muted-foreground"
              role="status"
            >
              {savedMessage ||
                (locked
                  ? "This role always has full access."
                  : dirty
                    ? `${changes.length} unsaved change${changes.length === 1 ? "" : "s"} · live access unchanged`
                    : "No unsaved changes · live access unchanged")}
            </div>
            <div className="flex gap-2">
              {!locked && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!dirty}
                  onClick={discard}
                >
                  Discard
                </Button>
              )}
              {locked ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewName("")
                    setTemplate(selected.id)
                    setCreating(true)
                  }}
                >
                  Duplicate role
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={!dirty || !valid}
                  onClick={() => setReview(true)}
                >
                  Review changes
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={review} onOpenChange={setReview}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review {selected.name}</DialogTitle>
            <DialogDescription>
              This saves a role draft in this browser. It does not change
              anyone’s current access.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {changes.map((change) => (
              <div
                key={change}
                className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm"
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                {change}
              </div>
            ))}
          </div>
          {(sensitive > 0 || selected.scope === "all") && (
            <p className="rounded-xl border border-warning/25 bg-warning/5 p-3 text-xs leading-relaxed">
              This role includes {sensitive} sensitive permission
              {sensitive === 1 ? "" : "s"} and access to{" "}
              {selected.scope === "all"
                ? "all projects"
                : "assigned projects only"}
              .
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReview(false)}>
              Keep editing
            </Button>
            <Button onClick={save}>Save draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a role</DialogTitle>
            <DialogDescription>
              Start from an existing role, then tailor its permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-role-name" className="text-sm font-medium">
                Role name
              </label>
              <Input
                id="new-role-name"
                value={newName}
                maxLength={60}
                placeholder="e.g. Project manager"
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role-template" className="text-sm font-medium">
                Start from
              </label>
              <Select
                value={template}
                onValueChange={(value) => value && setTemplate(value)}
              >
                <SelectTrigger id="role-template" className="w-full">
                  <SelectValue>
                    {roles.find((role) => role.id === template)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {roles.some(
              (r) => r.name.toLowerCase() === newName.trim().toLowerCase()
            ) && (
              <p className="text-xs text-destructive">
                Choose a unique role name.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                !newName.trim() ||
                roles.some(
                  (r) => r.name.toLowerCase() === newName.trim().toLowerCase()
                )
              }
              onClick={create}
            >
              Create draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
