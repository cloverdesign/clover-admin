# Backend requests

Changes the frontend needs from the Clover CMS API. Written against the live
spec **v3.0.0** (`https://api.cloverdesign.xyz/docs.json`). Each is additive and
low-risk; the `Milestone` / `ProjectUpdate` data models already exist.

---

## 1. Expose milestones for reading (blocking the milestone timeline)

Today milestones are **write-only**: `POST` / `PUT` / `DELETE` exist under
`/api/projects/{id}/milestones`, but **no endpoint returns them** — they aren't
in any GET response and aren't embedded in the project. So a milestone is only
visible in the immediate response of the call that created/updated it; it can't
be re-read on reload or shown in the client portal.

### 1a. Admin — new endpoint: `GET /api/projects/{id}/milestones`
- **Auth:** `AdminBearer` (approved admin), same as the milestone write endpoints.
- **Returns:** the project's milestones, **sorted by `order` ascending**.
- **Response** (standard envelope, `data` is a `Milestone[]`):

```json
{
  "success": true,
  "message": "Milestones retrieved",
  "data": [
    {
      "id": "…",
      "projectId": "…",
      "title": "Design handoff",
      "description": null,
      "status": "PENDING",
      "order": 0,
      "dueDate": "2026-08-14T00:00:00.000Z",
      "completedAt": null,
      "phase": "Design",
      "createdAt": "…",
      "updatedAt": "…"
    }
  ]
}
```
- **Errors:** `401` (no/invalid token), `404` (project not found).

### 1b. Portal — embed `milestones` in the project response
- **Endpoint:** `GET /api/portal/projects/{id}` (and `GET /api/portal/projects`
  list items if cheap).
- **Auth:** `ClientBearer`, scoped to the client's own project (unchanged).
- **Change:** add a **`milestones: Milestone[]`** array to the returned `Project`
  `data`, sorted by `order`. The portal has no separate milestones endpoint and
  shouldn't need one — embedding keeps the client timeline to a single request.

---

## 2. Add a `phase` field to `Milestone` (to group milestones by phase)

Milestones and phases are currently unrelated: `Milestone` has no `phase`, and
`Project.phase` is a single string (the project's current stage). To show
milestones grouped under phases (Discovery → Design → Development → Launch), add
a phase to the milestone. Free-text string, mirroring `Project.phase` (nullable)
— no new enum/validation needed.

- **Model:** add nullable `phase: string` to `Milestone` (+ migration).
- **Write bodies:** accept optional `phase` on
  `POST /api/projects/{id}/milestones` and `PUT …/{milestoneId}`.
- **Response:** include `phase` in the `Milestone` returned everywhere (create,
  update, and the read path in §1).

Once §1 + §2 land, the admin milestone editor and a portal milestone timeline
both become real, grouped by phase, with per-phase progress possible.

---

## 3. Notifications feed (header bell + attention badges)

The admin shell now has a notifications bell and needs a server-generated
attention feed. There is **no notification model or endpoint today**. The
frontend is already built against the contract below and degrades gracefully
(empty "all caught up" state, no errors) until it ships.

### 3a. New endpoint: `GET /api/notifications`
- **Auth:** `AdminBearer` (approved admin). Scoped to the calling admin.
- **Returns:** the admin's notifications, **newest first** (`createdAt` desc).
  A reasonable cap (e.g. the most recent 50) is fine — the UI is a dropdown,
  not an archive.
- **Polling:** the client refetches every ~60s; no websocket/SSE required.
- **Response** (standard envelope, `data` is a `Notification[]`):

```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": [
    {
      "id": "…",
      "type": "INVOICE_OVERDUE",
      "title": "Invoice overdue",
      "body": "Acme Co · $4,200 · 3 days late",
      "href": "/admin/invoices/inv_123",
      "entityType": "invoice",
      "entityId": "inv_123",
      "createdAt": "2026-08-14T09:00:00.000Z"
    }
  ]
}
```
- **Errors:** `401` (no/invalid token).

### 3b. Notification model
Server **derives** these from existing domain signals (no admin authoring). The
four `type`s the frontend renders, and the signal each is generated from:

| `type` | Generated when | `href` target |
|---|---|---|
| `INVOICE_OVERDUE` | an invoice passes its due date unpaid (`status = OVERDUE`) | the invoice |
| `REVISION_REQUESTED` | a client raises / is awaiting a revision (`status` `REQUESTED` or `IN_REVIEW`) | the revision request |
| `DELIVERABLE_REVIEW` | a deliverable is submitted and awaiting admin review / client sign-off | the deliverable's project |
| `MILESTONE_DUE` | a milestone is due soon or overdue | the milestone's project |

- `title` — short headline (e.g. "Invoice overdue").
- `body` — nullable one-line context (e.g. "Acme Co · $4,200 · 3 days late").
- `href` — in-app deep link the bell navigates to on click.
- `entityType` — one of `invoice` | `revision` | `deliverable` | `milestone` |
  `project` | `null`; `entityId` its id (for grouping / dedup).
- `createdAt` — ISO `date-time`.

### 3c. Read state — **no endpoint needed**
Read/seen state is tracked **per-device on the client** (localStorage), so the
wire model intentionally has **no `read` field** and there is **no
mark-as-read endpoint** to build. If cross-device read state is wanted later,
add `read: boolean` to the model plus `PATCH /api/notifications/{id}/read` and
`POST /api/notifications/read-all`; the client can adopt them without a UI
change.

---

## Related gaps (lower priority, same class)

- **Project `updates`** are also write-only (`POST` / `DELETE`, no GET). If
  milestones get a read path, do the same for updates (embed in the portal
  project response and/or `GET /api/projects/{id}/updates`) so the client
  "project updates" feed can work.
- **Portal invoices** — the PRD shows invoices in the portal, but there's no
  `/api/portal/.../invoices` endpoint. A client-scoped read would light up an
  invoices section on the portal.

---

## Notes

- Frontend is already staged for §1: `Project.milestones?: Milestone[]` exists in
  the client models and the admin editor reads it — a read path makes it durable
  instead of session-only.
- Date fields are `date-time`; the frontend sends full ISO timestamps (a bare
  `yyyy-mm-dd` is rejected as an invalid datetime).
