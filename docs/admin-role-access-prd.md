# Admin role access control — backend PRD

**Status:** Proposed backend implementation requirements  
**Audience:** Backend engineer / API owner  
**Related docs:** [`admin-access-backend.md`](./admin-access-backend.md), [`api/openapi.json`](./api/openapi.json)

## 1. Summary

Implement server-enforced authorization for the Clover admin workspace, including live arbitrary custom roles. The existing UI had hard-coded `ADMIN` and `SUPER_ADMIN` gates, which could not represent configurable roles or protect API data and writes. The frontend is being updated to consume effective permission claims when available; the Roles & Permissions UI still saves local drafts only. This project makes role definitions and assignments persistent and authoritative on the server, and makes the backend enforce effective permissions on every request.

## 2. Problem and goals

An `ADMIN` can currently be prevented from seeing a page in the browser while still potentially calling its API directly. Project list/detail responses may also expose commercial fields even when the UI hides them. Authorization must therefore live on the server and apply consistently to routes, nested resources, file access, search, counts, notifications, exports, and mutations.

### Goals

- Preserve the built-in `ADMIN` and `SUPER_ADMIN` identities while enabling arbitrary custom role definitions and assignments. `ADMIN` permissions are configurable; only `SUPER_ADMIN` is immutable and unconditionally full access.
- Enforce effective permissions and project scope on all admin API operations.
- Scope contributor access to projects assigned to the authenticated admin.
- Return role-safe response shapes that do not disclose hidden fields.
- Reject unsafe writes, including mixed payloads containing both permitted and forbidden fields.
- Apply changes to existing sessions when approval, role, or assignment changes.
- Preserve the client portal's separate identity and authorization model.
- Provide role CRUD, role assignment, change previews, concurrency control, and audited permission changes.

### Out of scope

- Changing client-portal authorization.
- Treating hidden navigation or disabled controls as security enforcement.

## 3. Actors and access prerequisites

Every admin request must derive the actor from the validated server-side session/token. Never accept a request's `role`, `adminId`, `ownerId`, or claimed assignment as proof of authorization.

- **ADMIN:** built-in role intended for project contributors, including contractors. Its initial permissions are the seeded contributor defaults in Section 4; a super admin can change those grants and scope. The name `ADMIN` does not imply a fixed permission set.
- **SUPER_ADMIN:** workspace owner. Access to all admin capabilities and all projects.
- **Custom role:** any additional role definition created by a super admin. It receives only its explicitly granted permissions and scope.
- **Unapproved, unverified, revoked, or disabled account:** no admin resource access. Both email verification and approval are required.
- **Client portal user:** remains governed by portal authentication and client/project relationships, not admin roles.

Authorization must default to deny when the route, action, relationship, or field is not explicitly allowed.

## 4. Authorization policy

| Capability | Seeded `ADMIN` default | `SUPER_ADMIN` |
| --- | --- | --- |
| View project brief, timeline, phase/status, milestones | Assigned projects | All projects |
| Complete/reopen milestones and update progress | Assigned projects | All projects |
| View deliverables, versions, and feedback | Assigned projects | All projects |
| Create/update deliverables and upload versions | Assigned projects | All projects |
| Delete deliverables | Denied | Allowed |
| View project value, budget, currency, invoices, payments, revenue | Denied | Allowed |
| Edit project commercial data | Denied | Allowed |
| Create/edit/archive/delete projects; change scope, dates, phase/status | Denied | Allowed |
| Create/delete milestones | Denied | Allowed |
| Manage project assignments or admin accounts | Denied | Allowed |
| Read/manage client records, invitations, and portal access | Denied | Allowed |
| Read/approve revision requests and commercial approvals | Denied | Allowed |
| CMS, media library, and workspace settings | Denied | Allowed |
| Notifications | Denied until contributor-safe contract is implemented | Allowed |


The `ADMIN` column is the initial seed only; it is not a permanent policy. After configuration, persisted role grants and scope are authoritative for `ADMIN` just as they are for custom roles. A super admin can change the built-in Admin role's display name, description, permissions, and project scope; its stable role ID remains `ADMIN`. The protected `SUPER_ADMIN` owner role cannot be removed, renamed, edited, or converted. Custom roles receive only explicit grants and scope. An endpoint/action absent from the permission catalog is denied to all non-super-admin roles until explicitly added and documented. `SUPER_ADMIN` is the only role with unconditional full access and authority over role definitions and assignments.

## 5. Functional requirements

### 5.1 Authentication and authorization checks

1. Validate the session and re-check current account approval, verification, revocation/disabled state, and role for each request or through a revocation mechanism with equivalent immediacy.
2. Resolve the actor ID only from the authenticated session.
3. Apply authorization to list and detail reads, nested routes, mutations, file metadata and bytes, search, aggregate/count endpoints, exports, and background operations triggered by a request.
4. For project-scoped data, resolve the parent project from the persisted resource relationship, then check current assignment. Do not authorize based only on a supplied project ID.
5. For inaccessible object IDs, return a consistent not-found or forbidden response according to the API's existing convention, without confirming the existence of a restricted record.
6. Never partially apply a payload. Validate the full requested operation before writing; reject the whole request if any field or related object is unauthorized.

### 5.2 Project reads and response shaping

- `SUPER_ADMIN` may read all projects and the existing full representation.
- A role with `projects.view` may read projects within its configured scope. `assigned` scope means only projects assigned to the authenticated user; `all` scope means all projects. `SUPER_ADMIN` always has all-project scope.
- Include commercial fields such as `totalValue`, `budget`, and `currency` only when the role has `finance.view`. Omit internal/commercial `notes`, embedded invoices, payment details, and commercial aggregates unless separately covered by an explicit permission. Do not infer permission from the role name.
- Do not include full client records or assigned-admin records (including names, emails, account metadata) unless the role has the specific permission to read those records.
- If the UI needs a client identifier, return a safe display label or similarly minimal field. Do not allow this label to become a path to client records.
- Return sufficient explicit assignment/access metadata for the UI to determine the current contributor's project scope without exposing other admins' private account data.
- Apply the same response policy to project details embedded in deliverables, milestones, updates, search results, dashboards, and future export endpoints.
- Fields such as briefs, deliverables, and feedback are visible to contributors under current policy. Users must not put commercial secrets in those fields; content sanitization cannot be inferred from role checks.

### 5.3 Project and milestone writes

- A role with `projects.progress` may update milestone completion/status and derived project progress only within its project scope.
- A role without the corresponding project edit/create/assign/delete permission may not edit project scope, ownership, assignment, title/brief, project dates, phase, lifecycle status, archive state, client association, commercial fields, or deletion state.
- Creating/deleting milestones and changing milestone metadata require `projects.edit`; status/progress changes require `projects.progress`.
- Enforce field allowlists at the server boundary. Reject extra/forbidden keys even when the allowed status field is also present.
- The frontend milestone toggle sends a status-only payload. Accept status-only updates; do not allow title/description/due date/order merely to accommodate old clients echoing unchanged metadata.
- `SUPER_ADMIN` retains the documented project and milestone workflows.

### 5.4 Deliverables and files

- Roles with `delivery.view` may list/read deliverables; roles with `delivery.edit` may create/update them. Both are limited to the role's project scope.
- Verify that milestone IDs belong to the same project and that deliverable updates cannot move a record to another project by changing an ID/reference.
- Deletion requires `delivery.delete`; `SUPER_ADMIN` retains this permission.
- Authorize both file metadata and the actual download/preview path. A hidden UI or unguessable URL is not authorization.
- Ensure generated, signed, cached, or public asset URLs cannot be used to bypass a later role/assignment change. Revoke or expire access consistently with the storage model.

### 5.5 Restricted resource families

For every non-super-admin role, deny reads and writes to the following unless the role has the named permission:

- invoices, payments, invoice PDFs/previews, and nested project invoice routes (`invoices.view`, `invoices.manage`, `invoices.paid`, or `invoices.delete`, as applicable);
- client records, client editing/deletion, portal invitations, and portal access controls (`clients.view`, `clients.edit`, `clients.invite`, `clients.delete`);
- team/admin account listing and lifecycle actions (`team.manage`); role definitions, assignments, and permission grants remain super-admin-only;
- project assignments (`projects.assign`);
- revision requests and commercial approvals (`revisions.view`, `revisions.approve`);
- CMS pages/media/publishing (`site.edit`, `site.publish`) and workspace settings (`workspace.settings`);
- notification data: deny every non-super-admin role until a safe contributor-specific payload and permission are implemented.

Apply restrictions to the endpoint families already present in the API contract (including `/api/admins`, `/api/clients`, `/api/projects`, `/api/invoices`, `/api/deliverables`, `/api/notifications`, project nested routes, and invoice PDF routes), plus any aliases, legacy endpoints, or future equivalents. Build an endpoint inventory from the current OpenAPI spec and audit actual server routes; the spec alone is not evidence of enforcement.

### 5.6 Notifications (separate enablement)

Do not enable contributor notifications until the backend can return a contributor-safe contract. That contract must:

- allowlist event types and structured fields;
- include only events for currently assigned projects;
- exclude invoice amounts, financial status, commercial notes, sensitive free text, and unsafe links;
- re-check access when reading and following notification links;
- avoid exposing information through counts, unread totals, or search.

Until that contract exists, deny non-super-admin access to notification endpoints and keep the frontend bell hidden for those roles.

### 5.7 Session freshness, audit, and owner protections

- Existing sessions must stop working promptly after demotion, revocation, disabling, or removal from a project. Do not rely only on the role captured at login.
- If authorization is cached, define and enforce a short invalidation path for role/assignment changes.
- Record sensitive role, assignment, approval, revocation, and destructive changes with actor, target, timestamp, operation, and before/after values (excluding secrets).
- Prevent deleting or demoting the final active `SUPER_ADMIN`.
- Prevent self-escalation and unauthorized approval or role changes.
- Ensure failed or rejected operations create no partial data changes or side effects.

### 5.8 Workspace settings API

The admin Settings page is a shared workspace configuration surface. Its first
release covers workspace identity and regional defaults. Frontend fields are a
preview until these APIs exist; browser-local values must not be treated as
authoritative workspace configuration.

#### Initial settings fields

- `workspaceName` (required, trimmed, bounded length).
- `contactEmail` (nullable, valid email when present).
- `timezone` (required IANA timezone identifier).
- `defaultCurrency` (required supported ISO 4217 currency code). This is the
  default for newly created financial records only; it must not rewrite currency
  on existing projects, invoices, or payments.
- `dateFormat` (enum from a server-owned supported list).

The shared default currency is distinct from the existing per-user display
currency in browser storage. Do not silently synchronize or overwrite that
personal preference. Workspace logo upload, notification preferences, invoice
numbering, and tax/payment terms are not part of the initial Settings API; add
them only with their own validation and persistence contract.

#### API contract

- `GET /api/workspace/settings`: authenticated admin with `workspace.settings`;
  returns the settings object, supported timezone/currency/date-format options,
  and a revision/version for concurrency. `SUPER_ADMIN` is allowed by its
  unconditional access. A role with the explicitly granted `workspace.settings`
  permission is also allowed.
- `PATCH /api/workspace/settings`: same permission; accepts only the documented
  fields, validates the complete resulting settings object, and applies changes
  atomically. Unknown or unauthorized fields fail the entire request.
- Return the canonical persisted values and updated version. Reject stale
  versions with the API's standard conflict response; do not last-write-wins.
- Derive actor/workspace from the authenticated session. Never accept a client
  supplied workspace ID as authority. If the product later supports multiple
  workspaces per actor, validate membership against the session.
- `workspace.settings` governs this settings resource only. It must not imply
  `roles.manage`, team account management, CMS publishing, or access to other
  workspace resources. Only `SUPER_ADMIN` has unconditional full access.
- Audit successful changes with actor, workspace, timestamp, changed field
  names, and before/after values. Do not log secrets. If settings include
  credentials in future, store and return them using a dedicated secret contract.
- If settings are cached, invalidate them for all workspace members after a
  successful update. Return no settings from a cross-workspace or unauthorized
  request.

#### Frontend integration requirements

- Load saved settings and supported options from `GET`; render loading, error,
  empty/default, and retry states.
- Enable Save only when fields are valid and dirty. Submit a versioned `PATCH`,
  show field-level validation and conflict errors, and replace the form with the
  canonical server response on success.
- Refresh dependent workspace UI after changes. The default currency affects
  only creation defaults; it does not change the personal display currency
  control or existing record currencies.
- Show Settings navigation and route access to any approved/verified role with
  `workspace.settings`. Never hard-code the route to the `ADMIN` or
  `SUPER_ADMIN` role name; `SUPER_ADMIN` remains the global bypass.

## 6. Live arbitrary role requirements

The frontend's `/admin/team/roles` editor currently stores drafts in browser local storage under a per-account key. Replace that persistence with backend role APIs. The browser catalog is a starting UX contract; the backend owns and validates the canonical permission catalog. Never accept browser-local role data as authorization evidence.

1. Persisted role definitions with stable IDs, name, description, project scope (`assigned` or `all`), permission IDs, system-role marker, version, creator, and timestamps.
2. Seeded `ADMIN` and `SUPER_ADMIN` definitions. Seed `ADMIN` with the contributor defaults below, but permit a super admin to change its permissions and scope. `SUPER_ADMIN` remains immutable and protected from accidental removal/demotion; it is the sole unconditional full-access role.
3. A deny-by-default, server-owned permission catalog. Initial IDs should align with the UI draft catalog where suitable:
   - `projects.view`, `projects.progress`, `projects.edit`, `projects.create`, `projects.assign`, `projects.delete`
   - `delivery.view`, `delivery.edit`, `delivery.delete`, `revisions.approve`
   - `finance.view`, `finance.edit`, `invoices.view`, `invoices.manage`, `invoices.paid`, `invoices.delete`
   - `clients.view`, `clients.edit`, `clients.invite`, `clients.delete`
   - `site.edit`, `site.publish`, `workspace.settings`, `team.manage`, `roles.manage`
4. Server-side prerequisite validation. Examples: `projects.progress` and project actions require `projects.view`; `delivery.*` requires the relevant project visibility and `delivery.view`; `finance.edit` requires `finance.view`; invoice actions require `invoices.view`; `clients.edit`, `clients.invite`, and `clients.delete` require `clients.view`; `site.publish` requires `site.edit`.
5. Project scope enforcement on every project-related permission. Workspace-global permissions remain independent of project scope.
6. Explicit account-to-role assignment and a safe role-change operation that previews affected members and permission changes before commit.
7. Optimistic concurrency/version checks so stale edits cannot overwrite newer role definitions.
8. A current-user effective-permissions response used by the frontend for route navigation and action visibility. Return the permissions and scope resolved from the account's assigned role. The API remains the enforcement authority.
9. Audit events and immediate session/query permission refresh after role edits or assignments.
10. Protection against self-escalation, granting permissions the actor does not hold, changing immutable system roles, or removing the final owner.
11. Migration of existing users to seeded `ADMIN` / `SUPER_ADMIN` role records without changing their current effective access.
12. Role management, role assignment, and permission-grant endpoints must be restricted to `SUPER_ADMIN`. Do not make `roles.manage` grantable to ordinary/custom roles in the initial release; this prevents delegated role editors from escalating access. Team account administration can be delegated separately only if its permission cannot change roles or grant permissions.
13. Return the effective permission IDs, scope, and role identity for the current actor from the authenticated current-user endpoint so the UI can render from server state. The API must still enforce permissions on every request.
14. Include `roleId`, display `roleName`, `projectScope`, and `effectivePermissions` in the current-user response. Include role ID/name in admin member responses. Keep the legacy `role` field only for compatibility; never use it as the authorization source once role assignments are migrated.

Custom role creation and assignment are part of this delivery, not a follow-up phase. Updating the built-in `ADMIN` grants is also part of this delivery. The UI's current local drafts must not become effective until saved through the authorized backend API and explicitly assigned to accounts (or saved to the built-in role definition).

## 7. API compatibility and response behavior

- Preserve existing response envelope and error conventions where possible; add role-specific response DTOs/serializers instead of returning sensitive fields and relying on UI filtering.
- Validate request DTOs with explicit per-role/per-action allowlists.
- A request that includes a forbidden field must fail atomically even if the field value equals the current value.
- Return generic errors for restricted object IDs where object existence would otherwise leak.
- Ensure pagination totals, facets, related-record counts, dashboard aggregates, and search snippets are scoped to the actor.
- Ensure caching varies by authenticated actor/permission scope or is disabled for personalized responses. Never serve a super-admin response from a shared cache to an admin.
- Keep portal tokens and admin tokens non-interchangeable.
- Extend the OpenAPI contract for persisted roles, role assignment, and current-user effective-permission fields. Preserve legacy fields during migration, then document their deprecation.

## 8. Acceptance criteria

### Account and route access

- Unauthenticated, unverified, unapproved, revoked, and disabled admin accounts cannot read or mutate admin resources.
- Any non-super-admin role is denied each endpoint/action for which it lacks the required permission, including nested routes and PDF/file endpoints, regardless of UI state.
- `SUPER_ADMIN` retains all currently supported admin workflows.
- A demoted or revoked user's existing session loses access promptly without requiring a fresh login.
- Changing the built-in `ADMIN` grants changes its effective access; no authorization rule is permanently tied to the `ADMIN` role name.
- A custom role with no effective-permission response is denied by default. The frontend uses seeded Admin defaults only for legacy Admin profiles until server-resolved permissions are returned.

### Project scope and disclosure

- A role with `projects.view` can list and access only projects within its configured scope; roles without it cannot read project records.
- Guessed IDs for unassigned projects, milestones, deliverables, or files cannot reveal existence or data.
- Contributor project and nested response payloads contain none of the prohibited commercial fields or private client/admin records.
- Search, counts, dashboards, exports, notifications, and caches return only authorized records and fields.
- The UI uses current-user `effectivePermissions` and project scope for navigation, routes, visible actions, and query enablement. Removing a grant hides cached data promptly.
- Any non-super-admin custom role or reconfigured `ADMIN` with
  `workspace.settings` can read and update workspace settings; lacking that
  permission denies both UI route access and direct API requests.
- Granting `workspace.settings` does not grant role management, team account
  management, or other global permissions.

### Mutation safety

- A role with `projects.progress` can complete/reopen milestones and update permitted progress only within its project scope.
- Any forbidden project/milestone field in a payload causes full rejection and no side effects.
- Roles with `delivery.edit` can create/update scoped deliverables but cannot change project ownership, cross-link another project's milestone, or access files outside their scope. Delete requires `delivery.delete`.
- Every restricted write is denied when the actor lacks its specific permission, regardless of the role name.
- Self-escalation, forged role/admin IDs, and final-super-admin removal/demotion are rejected.

### Regression and security tests

- Test seeded and reconfigured `ADMIN`, representative custom roles, and `SUPER_ADMIN` against every endpoint/action in the API inventory, including direct object IDs.
- Test list/detail/nested payload shape, not only HTTP status.
- Test mixed safe/unsafe payloads and verify transaction rollback/no side effects.
- Test assignment removal, role demotion, revocation, and cache invalidation with an already-issued session.
- Test shared client/project relationships do not grant client-record access by implication.
- Test `SUPER_ADMIN` workflows remain functional and portal authorization remains independently enforced.

## 9. Delivery sequence

1. Inventory all API routes against `docs/api/openapi.json` and actual server handlers.
2. Define and seed the canonical permission catalog plus protected built-in role definitions.
3. Implement role CRUD, explicit role assignment, affected-member/change previews, version checks, and audit events.
4. Migrate existing users to built-in role records without changing effective access.
5. Add centralized effective-permission and project-scope checks for every API action.
6. Add role-safe response serialization and field-level mutation validation.
7. Enforce assignment scope on project, milestone, deliverable, and file operations.
8. Keep notifications disabled for roles that lack an approved safe notification contract.
9. Integrate current-user effective permissions and role APIs with the frontend editor.
10. Complete all acceptance tests in Section 8 before enabling custom role assignment in production.

## 10. Dependencies and implementation notes

- Backend repository and route/service implementation are not present in this frontend workspace. The OpenAPI document describes the client-facing contract but does not prove which rules the service currently enforces.
- The frontend now sends status-only milestone updates; align the backend DTO and validation with that request shape.
- Confirm the backend's current error status conventions, session revocation mechanism, storage provider behavior, and audit sink during implementation.
- Update the OpenAPI contract after endpoint behavior and response schemas are finalized.
