"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ShieldKeyIcon,
  Search01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"
import { useMe } from "@/lib/queries/auth-queries"
import { useDeleteRole, useRoles, useSaveRole } from "@/lib/queries/roles-queries"
import { isSuperAdmin } from "@/lib/access"
import {
  INITIAL_ROLES,
  PERMISSIONS,
  PERMISSION_GROUPS,
  detailsChanged,
  draftFromRole,
  permissionKeys,
  permissionsChanged,
  roleChanges,
  togglePermission,
  type Permission,
  type PermissionId,
  type RoleDraft,
} from "@/lib/role-drafts"
import type { Role } from "@/lib/api/models"
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

/** Selection key for the built-in, read-only super admin entry. */
const SUPER = "SUPER_ADMIN"
/** Selection key for a role that hasn't been created yet. */
const NEW = "new"

/** `roles.manage` stays super-admin only; it is never granted to a role. */
const grantable = (ids: readonly PermissionId[]) =>
  ids.filter((id) => id !== "roles.manage")

const SUPER_DRAFT: RoleDraft = {
  name: INITIAL_ROLES[0].name,
  description: INITIAL_ROLES[0].description,
  permissions: [...INITIAL_ROLES[0].permissions],
  otherKeys: [],
}

/** Starting points offered when creating a role (besides existing roles). */
const TEMPLATES: { id: string; name: string; permissions: PermissionId[] }[] = [
  {
    id: "template:contributor",
    name: "Contributor defaults",
    permissions: [...INITIAL_ROLES[1].permissions],
  },
  { id: "template:empty", name: "No permissions", permissions: [] },
]

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
  return <RolesLoader />
}

function RolesLoader() {
  const { data: roles, isLoading, isError } = useRoles()
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  if (isError || !roles)
    return (
      <p className="py-24 text-center text-sm text-muted-foreground">
        Couldn’t load roles.
      </p>
    )
  return <RolesEditor roles={roles} />
}

function RolesEditor({ roles }: { roles: Role[] }) {
  const saveRole = useSaveRole()
  const deleteRole = useDeleteRole()

  const saved = React.useMemo(
    () =>
      [...roles]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((role) => ({ role, draft: draftFromRole(role) })),
    [roles]
  )
  /** Unsaved edits, keyed by role id (or NEW). Survive switching roles. */
  const [edits, setEdits] = React.useState<Record<string, RoleDraft>>({})
  const [selectedKey, setSelectedKey] = React.useState<string>(
    () => saved[0]?.role.id ?? SUPER
  )
  const [search, setSearch] = React.useState("")
  const [review, setReview] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [template, setTemplate] = React.useState(TEMPLATES[0].id)

  // A role deleted elsewhere (or just now) falls back to the first entry.
  const savedEntry = saved.find((s) => s.role.id === selectedKey)
  const key =
    selectedKey === SUPER || (selectedKey === NEW && edits[NEW]) || savedEntry
      ? selectedKey
      : (saved[0]?.role.id ?? SUPER)
  const locked = key === SUPER
  const original = locked ? SUPER_DRAFT : savedEntry?.draft
  const selected = edits[key] ?? original ?? SUPER_DRAFT
  const isNew = key === NEW

  const changes = original
    ? roleChanges(original, selected)
    : [
        "Create role",
        ...selected.permissions.map(
          (id) => `Allow: ${PERMISSIONS.find((p) => p.id === id)?.label}`
        ),
      ]
  const dirty = !locked && (isNew || changes.length > 0)
  const nameTaken = (name: string, exceptId?: string) =>
    saved.some(
      (s) =>
        s.role.id !== exceptId &&
        s.role.name.trim().toLowerCase() === name.trim().toLowerCase()
    ) || name.trim().toLowerCase() === SUPER_DRAFT.name.toLowerCase()
  const duplicate = !locked && nameTaken(selected.name, selected.id)
  const valid = selected.name.trim().length > 0 && !duplicate
  const sensitive = PERMISSIONS.filter(
    (p) => p.sensitive && selected.permissions.includes(p.id)
  ).length
  const members = savedEntry?.role.adminCount ?? 0
  const groups = PERMISSION_GROUPS.map((g) => ({
    ...g,
    permissions: (g.permissions as readonly Permission[]).filter((p) =>
      `${g.title} ${p.label} ${p.description}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ),
  })).filter((g) => g.permissions.length)

  function select(next: string) {
    setSelectedKey(next)
    setSearch("")
  }

  function update(patch: Partial<RoleDraft>) {
    if (locked) return
    const safePatch = patch.permissions
      ? { ...patch, permissions: grantable(patch.permissions) }
      : patch
    setEdits((all) => ({ ...all, [key]: { ...selected, ...safePatch } }))
  }

  function clearEdit(k: string) {
    setEdits((all) => {
      const next = { ...all }
      delete next[k]
      return next
    })
  }

  function save() {
    if (!valid || locked) return
    const input = {
      id: selected.id,
      name: selected.name.trim(),
      description: selected.description.trim(),
      permissionKeys: permissionKeys(selected),
      changed: original
        ? {
            details: detailsChanged(original, selected),
            permissions: permissionsChanged(original, selected),
          }
        : undefined,
    }
    saveRole.mutate(input, {
      onSuccess: (role) => {
        clearEdit(key)
        if (isNew && role) setSelectedKey(role.id)
        setReview(false)
      },
    })
  }

  function discard() {
    clearEdit(key)
    if (isNew) select(saved[0]?.role.id ?? SUPER)
  }

  function remove() {
    if (!selected.id) return
    const id = selected.id
    deleteRole.mutate(id, {
      onSuccess: () => {
        clearEdit(id)
        setConfirmDelete(false)
        select(saved.find((s) => s.role.id !== id)?.role.id ?? SUPER)
      },
    })
  }

  function openCreate(from?: string) {
    setNewName("")
    setTemplate(from && from !== NEW ? from : TEMPLATES[0].id)
    setCreating(true)
  }

  function create() {
    const name = newName.trim()
    if (!name || nameTaken(name)) return
    const base =
      template === SUPER
        ? SUPER_DRAFT
        : (TEMPLATES.find((t) => t.id === template) ??
          saved.find((s) => s.role.id === template)?.draft ??
          SUPER_DRAFT)
    setEdits((all) => ({
      ...all,
      [NEW]: {
        name,
        description: "",
        permissions: grantable(base.permissions),
        otherKeys: "otherKeys" in base ? [...base.otherKeys] : [],
      },
    }))
    select(NEW)
    setCreating(false)
  }

  const createOptions = [
    ...TEMPLATES,
    ...saved.map((s) => ({ id: s.role.id, name: s.role.name })),
    { id: SUPER, name: `${SUPER_DRAFT.name} (all permissions)` },
  ]
  const listEntries = [
    { key: SUPER, draft: SUPER_DRAFT, role: undefined as Role | undefined },
    ...saved.map((s) => ({ key: s.role.id, draft: s.draft, role: s.role })),
    ...(edits[NEW] ? [{ key: NEW, draft: edits[NEW], role: undefined }] : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The right access for everyone who works with Clover.
          </p>
        </div>
        <Button onClick={() => openCreate(key)}>
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Create role
        </Button>
      </div>
      <TeamNavigation />
      <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Roles control what admins can do. Saved changes apply right away to
          everyone with the role. Super admins always have full access, and
          admins only see projects they’re assigned to.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[228px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-0">
          <div className="mb-3 flex items-center justify-between px-2">
            <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Roles
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {listEntries.length}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {listEntries.map((entry) => {
              const draft = edits[entry.key] ?? entry.draft
              const changed =
                entry.key === NEW ||
                (!!edits[entry.key] && roleChanges(entry.draft, draft).length > 0)
              return (
                <button
                  key={entry.key}
                  onClick={() => select(entry.key)}
                  aria-pressed={key === entry.key}
                  className={cn(
                    "min-w-48 rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:min-w-0",
                    key === entry.key
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
                      {draft.name || "Untitled role"}
                    </span>
                    {changed && (
                      <span
                        className="size-1.5 rounded-full bg-warning"
                        aria-label="Unsaved changes"
                      />
                    )}
                  </div>
                  <div className="mt-1.5 pl-6 text-xs text-muted-foreground">
                    {entry.key === SUPER
                      ? "Full access · protected"
                      : entry.key === NEW
                        ? `${draft.permissions.length} permissions · not created yet`
                        : `${draft.permissions.length} permissions · ${entry.role?.adminCount ?? 0} ${entry.role?.adminCount === 1 ? "member" : "members"}`}
                  </div>
                </button>
              )
            })}
          </div>
          {saved.length === 0 && !edits[NEW] && (
            <p className="mt-3 px-2 text-xs leading-relaxed text-muted-foreground">
              No custom roles yet. Create one, then assign it to admins from
              the Members tab.
            </p>
          )}
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
                  {locked ? "Protected role" : isNew ? "New role" : "Custom role"}
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
                {!locked && (
                  <span>
                    {isNew
                      ? "Not assigned to members"
                      : `${members} ${members === 1 ? "member" : "members"}`}
                  </span>
                )}
              </div>
            </div>

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
                          {permission.id === "roles.manage"
                            ? "Reserved for Super Admins. This permission cannot be granted to another role."
                            : permission.description}
                        </p>
                      </div>
                      <Switch
                        id={`permission-${permission.id}`}
                        aria-label={permission.label}
                        aria-describedby={`help-${permission.id}`}
                        disabled={locked || permission.id === "roles.manage"}
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
              {selected.otherKeys.length > 0 && (
                <section className="border-t py-5" aria-labelledby="group-other">
                  <h4 id="group-other" className="text-sm font-semibold">
                    Other permission keys
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Granted outside this editor. They’re kept when you save.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selected.otherKeys.map((k) => (
                      <Badge key={k} variant="outline" className="font-mono">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </section>
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
              {locked
                ? "This role always has full access."
                : isNew
                  ? "New role · not created yet"
                  : dirty
                    ? `${changes.length} unsaved change${changes.length === 1 ? "" : "s"}`
                    : "No unsaved changes"}
            </div>
            <div className="flex gap-2">
              {!locked && !isNew && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                  Delete
                </Button>
              )}
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
                  onClick={() => openCreate(SUPER)}
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
            <DialogTitle>Review {selected.name.trim()}</DialogTitle>
            <DialogDescription>
              {isNew
                ? "This creates the role. Nobody has it until you assign it."
                : members > 0
                  ? `Changes apply immediately to the ${members} ${members === 1 ? "admin" : "admins"} with this role.`
                  : "No admins have this role yet."}
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
          {sensitive > 0 && (
            <p className="rounded-xl border border-warning/25 bg-warning/5 p-3 text-xs leading-relaxed">
              This role includes {sensitive} sensitive permission
              {sensitive === 1 ? "" : "s"}.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReview(false)}>
              Keep editing
            </Button>
            <Button onClick={save} disabled={saveRole.isPending}>
              {isNew ? "Create role" : "Save role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {original?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {members > 0
                ? `${members} ${members === 1 ? "admin has" : "admins have"} this role. They’ll be left with no role until you assign another. Their accounts aren’t affected.`
                : "No admins have this role. This can’t be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteRole.isPending}
              onClick={remove}
            >
              Delete role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                    {createOptions.find((o) => o.id === template)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {createOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newName.trim() && nameTaken(newName) && (
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
              disabled={!newName.trim() || nameTaken(newName)}
              onClick={create}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
