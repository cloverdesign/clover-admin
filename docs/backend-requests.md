# Backend requests

Changes the frontend needs from the Clover CMS API. Written against the live
spec at `https://api.cloverdesign.xyz/docs.json`.

**Most of the original list has shipped** — see the table below. Three asks are
still open, and two of them block work that is otherwise finished.

> A note on checking this: `info.version` reads **3.0.0** both before and after
> six endpoints were added. The version string is not a change signal. Diff the
> paths against `docs/api/openapi.json`, or fetch `docs.json` and compare.

---

## Shipped

Verified against the live spec on 2026-08-28, and against a live portal session
where the spec alone couldn't settle it.

| # | Ask | Delivered as |
|---|---|---|
| 1a | Admin milestone read path | `GET /api/projects/{id}/milestones` |
| 1b | Portal embeds milestones | `GET /api/portal/projects` embeds `milestones`, `updates`, `invoices` |
| 2 | `phase` on `Milestone` | `Milestone.phase` |
| 3a | Notifications feed | `GET /api/notifications` |
| 3b | Notification model | matches, plus `read` |
| 3c | Server-side read state | `PATCH /api/notifications/{id}/read`, `POST /api/notifications/read-all` |
| 4 | Portal invoices read | `GET /api/portal/projects/{id}/invoices` — this one was always there; the 404 we saw was CORS, see §C |
| 5 | Review on portal deliverables | `Deliverable.review`, portal reads only — **partially**, see §A |
| 6 | Client-wide aggregate reads | `GET /api/portal/invoices`, `GET /api/portal/deliverables` |
| 7a | Approve-as-new-phase produces structure | `POST …/approve` takes `phase`, `milestones[]`, `endDate` |
| 7b | Decline captures a reason | `decisionNote` on `PUT …/status` and `POST …/approve` |
| 7c | Attachments as `{ url, name }[]` | matches |
| 7d | Deliverable → linked revision | `deliverableId` on the portal revision submit |

Also landed unasked, and equally useful: `GET /api/projects/{id}/updates`, which
closes the "Related gaps" note in the previous version of this doc.

The frontend consumes all of the above as of PR #12.

---

## A. Populate `review` on the **admin** deliverable read

The one ask from §5 that didn't fully land. `DeliverableReview` exists and is
embedded — but the schema scopes it:

> `review` — *"only populated on client portal reads
> (`GET /api/portal/projects/{id}/deliverables` and `GET /api/portal/deliverables`)"*

So the client's verdict is visible to the client and invisible to the studio.

**Why this blocks something concrete.** PRD §1.4 lists five things on the admin
dashboard: active projects, pending invoices, upcoming milestones, pending
revision requests, and **pending deliverable reviews**. The first four are built.
The fifth has no panel and can't have one — there is no admin-readable source for
it. `components/admin/deliverables/deliverables-list.tsx` carries the reason as a
comment.

**The inconsistency worth naming:** `NotificationType` already includes
`DELIVERABLE_REVIEW`, and `GET /api/notifications` documents it as created "at the
moment those events happen, for every approved admin". So the API tells an admin
a review happened, then offers no way to read what it said.

**Ask:** populate `review` on `GET /api/projects/{id}/deliverables` (admin), same
shape as the portal read. A separate `GET /api/deliverables/{id}/review` would
also work; embedding is preferred since the list is what the dashboard needs.

Frontend is staged for this — `Deliverable.review?: DeliverableReview | null` is
already modelled, with the portal-only restriction documented on the type.

---

## B. Validation errors must name the failing field

Every 400 is the same two keys, with no indication of which input was wrong:

```
$ curl -sX POST https://api.cloverdesign.xyz/api/portal/request-otp \
    -H 'Content-Type: application/json' -d '{}'
{"success":false,"message":"Required"}
```

The `Error` schema is `{ success, message }` — there is nowhere for a field name
to go.

**Why this is not cosmetic.** A form receiving `"Required"` cannot highlight the
input at fault, so the user is told something is wrong and not what. It also
costs real debugging time: a bug where invoice drafts couldn't be created
returned exactly this, and pinning it down took a probe matrix against a
nonexistent project id rather than reading the response.

**Ask:** add a field-level list to the error envelope on validation failures.
Shape is the backend's call; anything addressable works:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "dueDate", "message": "Required" },
    { "field": "lineItems.0.unitPrice", "message": "Expected number" }
  ]
}
```

Keeping the existing `message` as a human-readable summary is fine — the frontend
already renders it. `errors` would be additive and ignored until wired up.

---

## C. CORS: allowlist the local portal host, and reject with 403 not 500

Two separate problems, one of which currently blocks portal development.

**C1 — `http://clients.localhost:3000` isn't allowlisted.** The portal is served
from the `clients.` subdomain by design (`proxy.ts`; production
`clients.cloverdesign.xyz`, local `clients.localhost:3000`, which browsers
resolve to loopback per RFC 6761). The production host is allowed. The local one
is not, so **portal sign-in fails at the documented local dev URL** — the OTP
request never leaves the browser and the client sees only "Couldn't send a code."

```
Origin                             preflight
http://clients.localhost:3000      500   ← no allow-origin header
http://localhost:3000              204
https://clients.cloverdesign.xyz   204
```

**C2 — a rejected origin returns 500.** The 500 path emits no CORS headers, so
the browser reports an opaque network failure rather than a CORS error. That is
what made C1 read as "the endpoint 404s" for a while, and it is why this doc
previously claimed `GET /api/portal/projects/{id}/invoices` didn't exist. It
always did.

**Ask:**
1. Add `http://clients.localhost:3000` to the allowlist.
2. Reject a disallowed origin with **403** and the CORS headers still attached,
   so the browser surfaces an actionable error.

Repro:

```bash
curl -sD - -o /dev/null -X OPTIONS \
  https://api.cloverdesign.xyz/api/portal/request-otp \
  -H 'Origin: http://clients.localhost:3000' \
  -H 'Access-Control-Request-Method: POST'
```

---

## Notes

- Date fields are `date-time`; the frontend sends full ISO timestamps (a bare
  `yyyy-mm-dd` is rejected as an invalid datetime).
- The `Project` schema documents none of its embedded relations, though the
  endpoint summaries promise them. The summaries are right. Worth fixing so the
  schema can be trusted on its own.
- `GET /api/portal/projects` returns an undocumented `_count` on each item.
  Harmless, but it should either be in the schema or dropped.
- Priority, if it helps: **A** and **B** block or degrade shipped features; **C**
  blocks local portal work but has a workaround (sign in at
  `http://localhost:3000/portal/login`, which is allowlisted).
