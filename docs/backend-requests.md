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
      "read": false,
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
- `read` — `boolean`, whether the calling admin has read it (see §3c).
- `createdAt` — ISO `date-time`.

### 3c. Read state — server-side, per admin

Read/seen state lives **on the server**, per admin, so it's consistent across
devices and survives a cache clear (a `localStorage` flag drifts the moment the
admin opens a second browser). The model carries a **`read: boolean`** (§3b) and
two write endpoints keep it in sync:

- **`PATCH /api/notifications/{id}/read`** — mark one notification read.
  - **Auth:** `AdminBearer`, scoped to the calling admin (404 if it isn't theirs).
  - **Body:** none required; optionally `{ "read": false }` to mark unread again.
  - **Returns:** the updated `Notification`.
- **`POST /api/notifications/read-all`** — mark every one of the admin's
  notifications read (the dropdown's "Mark all read").
  - **Auth:** `AdminBearer`, scoped to the caller.
  - **Returns:** `{ "success": true, "message": "…", "data": { "updated": 4 } }`.

The unread **count** for the header badge is derived client-side from the list
(`data.filter(n => !n.read).length`), so no separate count endpoint is needed
while the list is capped (§3a). The frontend currently tracks read state in
`localStorage` and will switch to these once they ship.

---

## 4. Portal invoices — client-scoped read (blocking the portal invoices + billing)

Invoices exist admin-side (`GET /api/projects/{id}/invoices`) but there is **no
portal equivalent**, so the portal's invoices section and the dashboard billing
snapshot can't load. `GET /api/portal/projects/{id}/invoices` currently **404s**.

### New endpoint: `GET /api/portal/projects/{id}/invoices`
- **Auth:** `ClientBearer`, scoped to the client's own project.
- **Returns:** the project's **issued** invoices only — exclude `DRAFT` (drafts
  stay internal to the studio) — sorted by `issuedDate` desc.
- **Response** (standard envelope, `data` is an `Invoice[]`):

```json
{
  "success": true,
  "message": "Invoices retrieved",
  "data": [
    {
      "id": "…",
      "projectId": "…",
      "invoiceNumber": "INV-0001",
      "amount": 4200,
      "currency": "USD",
      "lineItems": [{ "description": "Design phase", "amount": 4200 }],
      "description": null,
      "status": "SENT",
      "issuedDate": "2026-08-01T00:00:00.000Z",
      "dueDate": "2026-08-15T00:00:00.000Z",
      "paidDate": null,
      "pdfUrl": "https://…/inv-0001.pdf",
      "createdAt": "…",
      "updatedAt": "…"
    }
  ]
}
```
- **Errors:** `401` (no/invalid token), `404` (project not found).
- **Frontend status:** already built and calling this route; it treats a `404`
  as an empty list, so the invoices section and dashboard billing light up
  automatically once it ships. The path is already in `docs/api/openapi.json`,
  marked `x-status: planned`.

Mirror of the admin `GET /api/projects/{id}/invoices`, client-scoped and
draft-filtered.

---

## 5. Return the client's review on portal deliverables (persist approve / request-changes)

The review **write** path exists — `POST /api/portal/deliverables/{id}/review` —
but the deliverable **read** carries no review, so once a client approves or
requests changes the outcome is **lost on reload** (the portal only holds it in
session state). 

### Change: embed the client's latest review in the portal deliverables read
- **Endpoint:** `GET /api/portal/projects/{id}/deliverables`.
- **Change:** add **`review: DeliverableReview | null`** to each returned
  `Deliverable` — the client's most recent review of that version:

```json
{
  "status": "APPROVED",               // or "CHANGES_REQUESTED"
  "comment": "Looks great, ship it",  // nullable
  "reviewedAt": "2026-08-12T10:30:00.000Z"
}
```
- Lets the portal show "You approved this" / "Changes requested" durably and hide
  the review controls once a version has been acted on, instead of resetting them
  on every reload.

---

## 6. Client-wide aggregate reads for the dashboard (optional, perf)

The client dashboard summarizes across **all** the client's projects, so it
currently fans the per-project reads out (`…/deliverables`, `…/invoices`, and
`…/{id}` for milestones) — an N+1 that grows with project count. Two
client-scoped list endpoints would collapse each to a single request:
- `GET /api/portal/deliverables` → the client's `READY` deliverables across all
  their projects.
- `GET /api/portal/invoices` → the client's issued invoices across all their
  projects.
- **Auth:** `ClientBearer`, scoped to the caller; item shapes identical to the
  per-project reads (§4 for invoices).
- **Frontend status:** nice-to-have. The dashboard works today via fan-out — this
  is purely a performance win as a client's portfolio grows.

---

## 7. Revision request flow — make each decision durable, navigable, communicated

The status machine works (`REQUESTED → IN_REVIEW → APPROVED/DECLINED`, mirrored on
both admin and portal), but the handoffs around it are thin. Today:
`POST /api/portal/projects/{id}/revision-requests` (client submit) → admin
`GET /api/revision-requests` → `PUT …/{id}/status` (in-review / decline) →
`POST …/{id}/approve` `{ type: "new_phase" | "new_project" }`. The requests below
close the gaps that leave a decision invisible or unexplained.

### 7a. Approve "as new phase" must produce a structural, navigable result *(the main gap)*

Approving `new_phase` today only writes a `resultingPhaseNote` **string** on the
revision — **nothing changes on the project**. There's no Phase entity, milestones
have no read path (§1), and the approve call carries no substance, so a client sees
"Approved" with no new phase, milestones, or timeline change. (`new_project` works
because it returns `resultingProjectId` the portal can link to.)

**Decided:** the admin authors the new phase **inline at approval** — the "As new
phase" action opens a small form (phase name, one or more milestones, optional new
end date) rather than a bare dropdown item, and the backend scaffolds it in one
call. The existing milestone editor still edits those milestones afterward.

Contract for `POST /api/revision-requests/{id}/approve` when `type: "new_phase"`:

```json
{
  "type": "new_phase",
  "phase": "Phase 2 — Rollout",           // required: phase label, written to the new milestones (§2)
  "milestones": [                          // required: at least one — the substance of the phase
    { "title": "Rollout kickoff", "dueDate": "2026-10-01T00:00:00.000Z" },
    { "title": "Go-live",          "dueDate": "2026-11-15T00:00:00.000Z" }
  ],
  "endDate": "2026-11-30T00:00:00.000Z"    // optional: extend the project's target finish
}
```

Validation:
- `phase` non-empty and `milestones` has **≥ 1** entry (a phase with no milestones
  is meaningless — reject with `400`).
- `milestones[].title` required; `dueDate` optional ISO `date-time`.

Backend effects (all on the **parent** project = `revision.projectId`):
- Create the supplied `milestones`, tagged with `phase` (needs `Milestone.phase`,
  §2), status `PENDING`, appended after the current `order` max (preserving array
  order).
- Set `Project.phase` to the new label; if `endDate` is given, extend
  `Project.endDate` (only forward — ignore an earlier date).
- **Set `revision.resultingProjectId = revision.projectId`** (or a dedicated
  `resultingPhaseProjectId`) so both surfaces can link to the project the phase
  landed on — symmetric with `new_project`.
- Set status `APPROVED`; return the updated `RevisionRequest`.

Depends on **§1** (milestone read) + **§2** (`Milestone.phase`) to be visible.
Once those land, the project timeline actually grows and the portal card can say
"View the updated project." **Frontend implication:** the admin approve control
changes from a plain dropdown item to a small form/dialog for the phase + its
milestones.

### 7b. Decline must capture a reason, shown to the client

Decline today is `PUT …/{id}/status` `{ "status": "DECLINED" }` — no reason — so
the client sees a bare "Declined" with no explanation or next step.

- Accept an optional **`decisionNote: string`** on the status update (and on
  approve), stored on the `RevisionRequest` and returned in every read
  (`GET /api/portal/revision-requests` included).
- The portal shows it under a declined/approved revision; the admin decline
  dialog gains a reason field.
- Prefer a single nullable `decisionNote` for any terminal decision over the
  current narrowly-named `resultingPhaseNote`.

### 7c. Revision attachments — one shape end to end (`{ url, name }[]`)

The client submits `attachments: [{ "url": "…", "name": "…" }]`, but the stored /
returned shape is inconsistent (admin reads `{ name, size }`), so the admin can't
open what the client attached.

- Accept and persist `attachments: { url: string, name: string }[]` on
  `POST /api/portal/projects/{id}/revision-requests`.
- Return the same shape on `GET /api/revision-requests` (admin) and
  `GET /api/portal/revision-requests` (client). Admin detail links each to `url`.

### 7d. Deliverable "request changes" → linked revision request

PRD §1.2.6 wants a deliverable "request changes" to convert into a revision request
tied to that deliverable. Today `POST /api/portal/deliverables/{id}/review`
`{ status: "CHANGES_REQUESTED" }` and a revision request are unrelated records.

**Decided: manual promotion, not auto-create.** The PRD says a change-request
*"can convert"* — opt-in, not automatic — and auto-raising a revision on every
"request changes" would flood the queue with tweaks that aren't scope changes. So:
- Add an optional **`deliverableId: string | null`** to `RevisionRequest` so a
  promoted request references the deliverable it came from.
- Accept `deliverableId` on the create bodies —
  `POST /api/portal/projects/{id}/revision-requests` (client "request changes →
  raise a revision") and admin promotion — and return it in every read so both
  sides can show "from deliverable X".
- The `CHANGES_REQUESTED` deliverable review stays its own record; promotion is a
  deliberate action, not a side effect of the review.

### 7e. Status-change notifications to the client (PRD §1.5)

The client only learns of a decision by reopening the portal — there's no push.

- Email the client on revision status transitions: **received** (`REQUESTED` ack),
  **approved**, **declined** (include `decisionNote` from §7b).
- Notify the **admin** on a new `REQUESTED` — this is the `REVISION_REQUESTED`
  notification type already specced in **§3b**; no new endpoint, just the trigger.
- Server-derived; no frontend endpoint beyond the existing admin notifications feed.

---

## Related gaps (lower priority, same class)

- **Project `updates`** are also write-only (`POST` / `DELETE`, no GET). If
  milestones get a read path, do the same for updates (embed in the portal
  project response and/or `GET /api/projects/{id}/updates`) so the client
  "project updates" feed can work.

---

## Notes

- Frontend is already staged for §1: `Project.milestones?: Milestone[]` exists in
  the client models and the admin editor reads it — a read path makes it durable
  instead of session-only.
- The **client portal** is fully built against §1b and §4–§5: the project
  milestone timeline, the invoices section, the dashboard billing snapshot, and
  deliverable review state are all wired and degrade gracefully (empty/quiet, no
  errors) until these land. §6 is a later performance-only optimization.
- Date fields are `date-time`; the frontend sends full ISO timestamps (a bare
  `yyyy-mm-dd` is rejected as an invalid datetime).
