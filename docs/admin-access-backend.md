# Admin access: backend requirements

> **Policy source:** [Admin role access control PRD](./admin-role-access-prd.md). `ADMIN` is a configurable seeded role profile; arbitrary custom roles are supported. Only `SUPER_ADMIN` has unconditional full access. The PRD is authoritative for live roles and server enforcement.

Status: frontend permission-aware UI is prepared; effective permissions and live role management require backend API support.

## Policy

Keep the existing roles. `ADMIN` is a project contributor (including contractors).
`SUPER_ADMIN` owns commercial data and workspace administration. Both require
an approved account and verified email.

| Capability | Seeded ADMIN default | SUPER_ADMIN |
| --- | --- | --- |
| Project brief, phase, status, timeline, milestones | Assigned projects | All projects |
| Deliverables and feedback; create/update deliverables | Assigned projects | All projects |
| Complete/reopen milestones; synchronize progress | Assigned projects | All projects |
| Project value, budget, currency, invoices, payments, revenue | Denied | Allowed |
| Create/edit/archive/delete projects; change scope, dates, status, phase | Denied | Allowed |
| Create/delete milestones; delete deliverables | Denied | Allowed |
| Manage project assignments and admin accounts | Denied | Allowed |
| Client records, portal invites and access | Denied | Allowed |
| Revision requests and commercial approvals | Denied initially | Allowed |
| CMS, media library and workspace settings | Denied | Allowed |
| Notifications | Hidden pending safe contributor payloads | Allowed |

## Required API changes

1. Enforce role and assignment on every read and write, including direct object
   IDs. Derive identity from the authenticated session. Do not trust client-supplied
   role, admin ID, project ID, or client ID as proof of access. Default to denial.
2. Return a contributor-safe project representation for ADMIN on list, detail,
   nested responses and any future search/export/dashboard endpoints. Omit
   `totalValue`, `budget`, `currency`, `notes`, embedded `invoices` and commercial
   aggregates. Do not send full client records or assigned admin account records.
   Supply a safe client/company label if contributors need it. Return explicit
   assignment/access information so the frontend can maintain project scoping
   without exposing team emails or account metadata.
3. Reject ADMIN access to invoice endpoints and nested project invoices, including
   create/update/delete/send/mark-paid/mark-overdue. Apply the same role restriction
   to clients and invites, team/account management, assignments, CMS/media, revision
   approvals and workspace settings. Audit existing enforcement; the frontend
   repository cannot establish which endpoints already enforce these rules.
4. Restrict writes by permission and field. Allow milestone completion/status and
   project progress only within the assigned role scope; reject fields the role
   cannot edit even in mixed payloads. The frontend milestone toggle now sends
   status only; do not require or accept unchanged metadata as a workaround.
5. Scope deliverable read/create/update operations to assigned projects. Validate
   milestone ownership and prevent moving a deliverable to another project by ID.
   Require SUPER_ADMIN for deletion. Protect file download access as well as
   metadata; public asset URLs are not made private by hiding UI.
6. Build contributor-safe notifications: allowlisted event types, safe structured
   fields, assignment-scoped recipients and safe links. No invoice amounts,
   commercial notes or sensitive free-text bodies. The frontend currently omits
   the notification bell entirely for ADMIN until this contract exists.
7. Re-evaluate current approval, role and assignment for existing sessions. Revoke
   access promptly when an admin is demoted, unassigned or disabled. Log sensitive
   changes with actor, target, timestamp and before/after values. Protect the final
   super admin from accidental removal or demotion.

## Frontend behavior and limitations

The UI blocks restricted routes before their shell/page mounts, filters navigation
and search, disables restricted reads, and hides cached restricted query results.
ADMIN's dashboard shows their projects instead of financial metrics. Project
creation/editing and assignment controls are restricted; milestone completion and
deliverable creation/editing remain available. Client names are unavailable in
some contributor views because the existing project model only includes clientId
and full client records are no longer fetched for ADMIN.

Project responses may still contain monetary fields in browser network traffic and
query caches. UI restrictions cannot prevent direct API calls, manual JavaScript,
or disclosure through previously downloaded data. Briefs, deliverables and feedback
remain visible; authors must keep commercial details out of those shared fields.
The client portal is outside this change and must retain its own authorization.

## Backend acceptance tests

- With ADMIN credentials, try every restricted endpoint directly; expect denial
  and no side effects, including forged role fields and mixed safe/unsafe payloads.
- Assigned project list/detail/nested payloads contain no commercial fields.
- Unassigned project, milestone and deliverable IDs cannot be read or mutated.
- Lists, counts, search, notifications, files and exports respect the same scope.
- Demotion, unassignment and account revocation take effect with an existing token.
- SUPER_ADMIN retains the permitted workflows; client portal access remains scoped
  to its authenticated client.

## Granular role editor design

The frontend now includes `/admin/team/roles`, linked from Team. This is an
interactive draft editor, not live role management. Drafts are stored locally per
super-admin account (`clover.role-drafts.v1.<adminId>`). Existing `ADMIN` and
`SUPER_ADMIN` authorization remains unchanged. Super admin is immutable; Admin
can be used as a draft template and custom roles can be created from any role.

The draft catalog in `lib/role-drafts.ts` separates project scope (`assigned` or
`all`) from individual permissions. Financial viewing, financial editing, invoice
viewing, invoice management, payment recording and deletion are separate grants.
Granting an action includes required viewing permissions; removing a prerequisite
removes dependent actions. Workspace permissions are explicitly global.

Before activating drafts, the backend needs:

- Stable role IDs, names, descriptions, project scope and permission IDs; seeded
  role defaults, immutable SUPER_ADMIN, and a deny-by-default permission catalog.
- Authorized list/create/update/delete role endpoints with version checks to
  prevent concurrent edits overwriting one another.
- Explicit role assignment to accounts, an affected-member count and a reviewed
  change summary. Custom drafts currently have no live member assignment.
- Server-side validation of permission dependencies and project scope, including
  client visibility derived from accessible projects (never all projects of a
  shared client by implication). Global workspace permissions remain separate.
- A current-user effective-permissions response to drive navigation, reads and
  actions. Replace current binary frontend checks only after this contract exists.
- Audit events for role edits and member assignment, immediate session permission
  refresh, and protections against self-escalation or removal of the final owner.

Local draft storage must never be accepted as authorization evidence or silently
applied to members when connecting this UI to the API.

## Workspace Settings API request

The frontend now includes a Settings page preview at `/admin/settings`. Its
workspace identity and regional-default fields are intentionally not saveable
until the backend contract is implemented. Add the shared settings resource in
the role-access PRD's §5.8. In particular:

- Persist workspace name, nullable contact email, IANA timezone, supported ISO
  currency code for new financial records, and supported date-format enum.
- Implement authorized `GET /api/workspace/settings` and atomic, versioned
  `PATCH /api/workspace/settings`; resolve workspace from the session, validate
  fields, return canonical values, and audit changes.
- Authorize using `workspace.settings` for both custom roles and reconfigured
  `ADMIN`. `SUPER_ADMIN` remains the only unconditional bypass. This permission
  must not imply `roles.manage`, `team.manage`, or CMS capabilities.
- Keep the shared default currency separate from the current per-user browser
  display-currency preference. It applies to new records only and does not
  rewrite existing project or invoice currencies.
