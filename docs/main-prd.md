# Clover Product  Client Portal &amp; Site CMS PRD

# 0. Overview

**Problem:** Clients have no visibility into project status/timelines/invoices without emailing the team, and the marketing site's content can't be updated without a code deploy.

**Solution:** Two modules ship together, both living behind the same admin panel:

1. **Client Portal** — a client-facing surface (passwordless auth, no sign-up) showing project progress, timelines, invoices, and deliverables, with client-initiated revision requests and deliverable reviews.
2. **Site CMS** — an internal module for managing content on the public Clover marketing site without a code deploy.

**Surfaces:**
- **Client Portal** — client-facing, passwordless auth, one project (or set of projects) per client
- **Admin Panel** — internal, authenticated: client/project onboarding, timelines, invoices, revision approvals, and CMS
- **Public Site** — reads published content from the CMS

---

# Module 1: Client Portal

## 1.1 Access Model

**Client Auth (passwordless)**
- No account creation, no password.
- Client's email is registered by admin at onboarding (tied to their client record).
- To view the portal, client enters their email → receives a one-time code or magic link → gains access to their project(s).
- Session persists for **30 days**, so they're not re-verifying every visit; re-verify by email after expiry.
- Access is **indefinite** — no link/token expiration, no project archiving that removes client visibility. Completed projects remain viewable.
- Because auth is tied to identity (email) rather than a bare link, this is more secure than a shareable URL and survives being forwarded — the new recipient would need to auth as themselves and won't have access unless they're a registered contact on the project.

**Admin Auth**
- Standard authenticated login (email/password or SSO), internal only.

## 1.2 UI Flows

### 1.2.1 Admin: Onboard a New Client
1. Admin clicks "New Client" from dashboard.
2. Enters client info: company/name, contact email (this becomes their auth identity), phone (optional).
3. Enters project info: project name, type, brief/description, start date, target end date, total project value, **currency** (only set/changed when a project actually needs one other than the default — not a mandatory field at onboarding).
4. Admin confirms → system emails the client a "your project is ready" notice with a link to the portal (client authenticates with their email from there).
5. Project starts in "Kickoff" / not-yet-started state.

### 1.2.2 Admin: Set/Update Progress & Timeline
1. Admin opens a project from client list.
2. Admin adds milestones: title, description, due date, status (upcoming / in progress / completed).
3. Admin reorders milestones, marks them complete as work progresses.
4. Admin sets overall project phase (Discovery → Design → Development → Launch, etc.) — drives what the client sees as "current stage."
5. Changes are live immediately; client sees the update next time they open the portal.

### 1.2.3 Admin: Generate an Invoice
1. Admin opens a project → Invoices tab.
2. Clicks "New Invoice" → enters amount, **currency** (defaults to project currency; only changed when that specific invoice needs a different one), description/line items, due date.
3. System auto-generates invoice number and PDF.
4. Admin sets status: Draft → Sent (or Paid, if recording after the fact).
5. On "Sent," client is notified by email; invoice appears in their portal invoice list.
6. Admin can mark Paid/Overdue manually later.

### 1.2.4 Client: View Project
1. Client goes to portal URL, enters email, verifies via code/magic link.
2. Lands on **client home** — always the first screen, regardless of how many projects they have. Lists all their projects (original + any revisions-as-separate-projects) with status/phase at a glance. Selecting one drops into its dashboard. Keeping this permanent (rather than conditional on project count) simplifies the frontend — no branching logic for single- vs multi-project clients.
3. Project dashboard shows: brief, current phase, milestone timeline, invoice list (with currency shown, PDF downloads).
4. If a revision is a phase within the same project instead of a separate one, it just appears as new milestones/timeline entries on that one project.
5. Can submit a **revision request** (see below), optionally with attachments. Otherwise read-only.

### 1.2.5 Revisions
Revisions cover new scope after original delivery. Admin decides, per case, whether it's:
- **A new phase on the existing project** — extends the timeline/end date, adds milestones to the same project, same invoice thread.
- **A new linked project** — its own brief, timeline, milestones, and invoices, associated with the same client, shown as a separate project in the client's portal / client home.

**Flow:**
1. Client clicks "Request Revision" on their project (or from a general "Request new project" entry point).
2. Client fills a short form: description of what they need, optional target timeframe, and can attach files (reference docs, briefs, images).
3. Request lands in admin's queue (visible on dashboard, tied to the client/project it came from), attachments included.
4. Admin reviews → either:
   - Approves and creates it as a new phase on the existing project, or
   - Approves and creates it as a new linked project (with its own brief/timeline/invoices), or
   - Declines / follows up outside the system.
5. Client sees status of their request (Requested → In Review → Approved/Declined) and, once approved, sees the resulting phase or project appear.

**Data implication:** Projects need a `parent_project_id` (nullable) to represent "this project is a revision of that one," so the client home can group original + revisions under one client, while each revision still has independent timeline/invoices if created as a separate project.

### 1.2.6 Deliverables
A dedicated space on each project where admin uploads finished work for the client to see, review, and download — separate from the brief/attachments used for onboarding or revision requests.

- Admin uploads a deliverable (file, or a link to an external asset like a Figma file or hosted build), gives it a title, description, and version label.
- Deliverable appears on the client's project dashboard under a "Deliverables" tab, tied to the milestone or phase it belongs to where relevant.
- Client can preview (where feasible — images, PDFs) or download.
- Client can leave a review on a deliverable: approve it, or request changes with a comment. This gives revisions a clear entry point — a "request changes" comment can convert directly into a revision request tied to that deliverable.
- Multiple versions of the same deliverable are kept (v1, v2, ...), so history isn't lost when a revised file is uploaded.

**Flow:**
1. Admin opens a project → Deliverables tab → "Add Deliverable."
2. Uploads file or adds link, titles it, optionally links it to a milestone.
3. Marks it Ready — client is notified.
4. Client opens Deliverables tab, views/downloads, and either approves or requests changes with a comment.
5. If changes are requested, admin can respond with a new version of the same deliverable (v2) or route it into a formal revision request if it's a bigger scope change.

**Data implication:** New `Deliverable` entity, versioned, linked to a project and optionally a milestone, with a lightweight `DeliverableReview` (approved / changes requested, comment, timestamp).

## 1.3 Core Data Entities

**Client** — company/contact name, email (auth identity), phone

**Project** — belongs to a client; name, type, brief, start/end dates, total value, **currency**, current phase, `parent_project_id` (nullable, for revisions), archived flag *(archiving is for admin organization only — does not remove client access)*

**Milestone** — belongs to a project; title, description, due date, status, order

**Invoice** — belongs to a project; number, amount, **currency**, description, status (draft/sent/paid/overdue), issued date, due date, paid date, PDF

**RevisionRequest** — belongs to a project (and client); description, target timeframe, attachments (file refs), status (requested/in review/approved/declined), resulting project/phase reference once approved

**Deliverable** — belongs to a project, optionally a milestone; title, description, version number, file or external link, status (ready/superseded), uploaded date

**DeliverableReview** — belongs to a deliverable; status (approved/changes requested), comment, reviewed date

**AuthSession** — client email, session token, created/expires timestamps

## 1.4 Admin Panel Structure (Portal-related)

- **Dashboard** — active projects at a glance, pending invoices, upcoming milestones, pending revision requests, pending deliverable reviews
- **Client List** — searchable/sortable, filter by status/type
- **Project Detail** — brief, milestones editor, phase setter, invoice list, deliverables manager, linked revisions/parent project, currency
- **Revision Requests** — queue of incoming requests, approve → choose (new phase / new project) → auto-scaffold
- **New Client/Project** flow (as above)

## 1.5 Notifications

- Welcome email on project creation (portal access instructions)
- Invoice notification email when an invoice is marked Sent
- Deliverable ready — notification to client
- Deliverable reviewed (approved / changes requested) — notification to admin
- Revision request status updates to client (received / approved / declined)
- Revision request received — notification to admin
- (Optional) milestone-completed notification

---

# Module 2: Site CMS

## 2.1 Purpose

A section of the admin panel for managing the public Clover marketing site's content, so non-technical team members can update copy/media without a code deploy.

## 2.2 Likely Content Types
*(to confirm against actual site structure — see open items)*
- Page copy (headline, body text blocks) per page (Home, About, Services, Contact, etc.)
- Case studies / portfolio entries (title, images, description, client name, tags)
- Testimonials
- Site-wide settings (contact email, social links, footer text)
- Media library (image uploads used across pages)

## 2.3 Flow
1. Admin opens CMS section, selects a page or content type.
2. Edits fields via form (rich text for copy, image upload for media).
3. Saves as Draft or Publishes directly.
4. Since the marketing site is **static** and hosted on **Vercel**, "Publish" triggers a Vercel deploy hook to rebuild/redeploy rather than reflecting instantly — admin UI should show a build-in-progress state and confirm once live (poll Vercel's deployment status API or listen for the deployment webhook).

## 2.4 Open Item
Need an inventory of the actual site's editable sections to finalize the content model — recommend a quick audit of cloverdesign.xyz page by page.
