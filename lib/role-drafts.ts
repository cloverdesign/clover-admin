/** Role editor UX data. Browser-saved drafts never authorize requests; the
 * INITIAL_ROLES entries mirror the backend's seeded defaults for the UI. */
export const PERMISSION_GROUPS = [
  {
    id: "projects",
    title: "Projects",
    description: "The work, its scope, and who can access it.",
    permissions: [
      {
        id: "projects.view",
        label: "View project details",
        description: "Briefs, timelines, milestones, phase and status.",
      },
      {
        id: "projects.progress",
        label: "Update progress",
        description: "Complete or reopen milestones and update progress.",
        requires: "projects.view",
      },
      {
        id: "projects.edit",
        label: "Manage project details",
        description: "Edit scope, deadlines, milestones, phase and status.",
        requires: "projects.view",
      },
      {
        id: "projects.create",
        label: "Create projects",
        description: "Start a new project and define its scope.",
      },
      {
        id: "projects.assign",
        label: "Manage project access",
        description: "Assign or remove people from a project.",
        requires: "projects.view",
        sensitive: true,
      },
      {
        id: "projects.delete",
        label: "Archive and delete projects",
        description: "Archive work or permanently remove a project.",
        requires: "projects.view",
        sensitive: true,
      },
    ],
  },
  {
    id: "delivery",
    title: "Deliverables & feedback",
    description: "Share work and keep delivery moving.",
    permissions: [
      {
        id: "delivery.view",
        label: "View deliverables and feedback",
        description: "Open project files, versions and client feedback.",
        requires: "projects.view",
      },
      {
        id: "delivery.edit",
        label: "Upload and edit deliverables",
        description: "Add versions and edit deliverable details.",
        requires: "delivery.view",
      },
      {
        id: "delivery.delete",
        label: "Delete deliverables",
        description: "Permanently remove files and their records.",
        requires: "delivery.view",
        sensitive: true,
      },
      {
        id: "revisions.view",
        label: "View revision requests",
        description: "Review incoming requests for changes to project scope.",
        requires: "projects.view",
      },
      {
        id: "revisions.approve",
        label: "Approve revision requests",
        description: "Accept scope changes or create a linked project.",
        requires: "projects.view",
        sensitive: true,
      },
    ],
  },
  {
    id: "finance",
    title: "Financial information",
    description:
      "Control what people can see separately from what they can change.",
    permissions: [
      {
        id: "finance.view",
        label: "View project monetary values",
        description: "See project fees, budgets and currency.",
        requires: "projects.view",
        sensitive: true,
      },
      {
        id: "finance.edit",
        label: "Edit project monetary values",
        description: "Change fees, budgets and currency.",
        requires: "finance.view",
        sensitive: true,
      },
      {
        id: "invoices.view",
        label: "View invoices",
        description: "See invoice line items, amounts and payment status.",
        requires: "projects.view",
        sensitive: true,
      },
      {
        id: "invoices.manage",
        label: "Create and send invoices",
        description: "Draft, edit and send invoices to clients.",
        requires: "invoices.view",
        sensitive: true,
      },
      {
        id: "invoices.paid",
        label: "Record payments",
        description: "Mark invoices as paid or overdue.",
        requires: "invoices.view",
        sensitive: true,
      },
      {
        id: "invoices.delete",
        label: "Delete invoices",
        description: "Permanently remove invoice records.",
        requires: "invoices.view",
        sensitive: true,
      },
    ],
  },
  {
    id: "clients",
    title: "Clients",
    description: "Contact records and client portal access.",
    permissions: [
      {
        id: "clients.view",
        label: "View client records",
        description: "See client contacts and billing details.",
        sensitive: true,
      },
      {
        id: "clients.edit",
        label: "Manage client records",
        description: "Create clients and edit contact or billing information.",
        requires: "clients.view",
        sensitive: true,
      },
      {
        id: "clients.invite",
        label: "Manage portal access",
        description: "Send portal invitations and manage client access.",
        requires: "clients.view",
        sensitive: true,
      },
      {
        id: "clients.delete",
        label: "Delete clients",
        description: "Permanently remove client records.",
        requires: "clients.view",
        sensitive: true,
      },
    ],
  },
  {
    id: "workspace",
    title: "Website & workspace",
    description:
      "Permissions here apply across the workspace, regardless of project scope.",
    permissions: [
      {
        id: "site.edit",
        label: "Edit website content",
        description: "Manage pages, blocks and the media library.",
      },
      {
        id: "site.publish",
        label: "Publish website changes",
        description: "Make content available on the public website.",
        requires: "site.edit",
        sensitive: true,
      },
      {
        id: "workspace.settings",
        label: "Manage workspace settings",
        description: "Change shared preferences and configuration.",
        sensitive: true,
      },
      {
        id: "team.manage",
        label: "Manage team accounts",
        description: "Approve, revoke or remove member accounts.",
        sensitive: true,
      },
      {
        id: "roles.manage",
        label: "Manage roles and permissions",
        description: "Grant access by editing roles and assignments.",
        sensitive: true,
      },
    ],
  },
] as const

export type PermissionId =
  (typeof PERMISSION_GROUPS)[number]["permissions"][number]["id"]
export type Permission = {
  id: PermissionId
  label: string
  description: string
  requires?: PermissionId
  sensitive?: boolean
}
export const PERMISSIONS: readonly Permission[] = PERMISSION_GROUPS.flatMap(
  (g) => [...g.permissions]
)
export type RoleDraft = {
  id: string
  name: string
  description: string
  scope: "assigned" | "all"
  permissions: PermissionId[]
  system?: boolean
}
const contributor: PermissionId[] = [
  "projects.view",
  "projects.progress",
  "delivery.view",
  "delivery.edit",
]
export const INITIAL_ROLES: RoleDraft[] = [
  {
    id: "SUPER_ADMIN",
    name: "Super admin",
    description:
      "Full workspace access. Reserved for people who manage Clover.",
    scope: "all",
    permissions: PERMISSIONS.map((p) => p.id),
    system: true,
  },
  {
    id: "ADMIN",
    name: "Admin",
    description:
      "Project contributors and contractors. Delivery access without financial information.",
    scope: "assigned",
    permissions: contributor,
    system: true,
  },
]

/** Grant prerequisites together; removing a prerequisite removes dependants. */
export function togglePermission(
  current: PermissionId[],
  id: PermissionId,
  enabled: boolean
): PermissionId[] {
  const next = new Set(current)
  function enable(key: PermissionId) {
    const permission = PERMISSIONS.find((p) => p.id === key)
    if (permission?.requires) enable(permission.requires)
    next.add(key)
  }
  if (enabled) enable(id)
  else {
    next.delete(id)
    let changed = true
    while (changed) {
      changed = false
      for (const p of PERMISSIONS) {
        if (next.has(p.id) && p.requires && !next.has(p.requires)) {
          next.delete(p.id)
          changed = true
        }
      }
    }
  }
  return PERMISSIONS.filter((p) => next.has(p.id)).map((p) => p.id)
}

export function roleChanges(before: RoleDraft, after: RoleDraft): string[] {
  return [
    ...(before.name !== after.name ? [`Rename to ${after.name}`] : []),
    ...(before.description !== after.description
      ? ["Update role description"]
      : []),
    ...(before.scope !== after.scope
      ? [
          `Project scope: ${after.scope === "all" ? "all projects" : "assigned projects only"}`,
        ]
      : []),
    ...PERMISSIONS.filter(
      (p) =>
        before.permissions.includes(p.id) !== after.permissions.includes(p.id)
    ).map(
      (p) =>
        `${after.permissions.includes(p.id) ? "Allow" : "Remove"}: ${p.label}`
    ),
  ]
}

export function loadRoleDrafts(key: string): RoleDraft[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "null")
    if (!Array.isArray(parsed)) return INITIAL_ROLES
    const valid = parsed.filter(
      (r): r is RoleDraft =>
        r &&
        typeof r.id === "string" &&
        typeof r.name === "string" &&
        typeof r.description === "string" &&
        ["assigned", "all"].includes(r.scope) &&
        Array.isArray(r.permissions) &&
        r.permissions.every((p: unknown) =>
          PERMISSIONS.some((permission) => permission.id === p)
        )
    )
    // The super-admin template always stays immutable, even in old local drafts.
    return [
      INITIAL_ROLES[0],
      valid.find((r) => r.id === "ADMIN") ?? INITIAL_ROLES[1],
      ...valid.filter((r) => r.id !== "ADMIN" && r.id !== "SUPER_ADMIN"),
    ]
  } catch {
    return INITIAL_ROLES
  }
}
