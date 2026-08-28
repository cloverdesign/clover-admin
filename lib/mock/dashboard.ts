/**
 * Typed dummy data for the admin dashboard — the single source the layout
 * prototypes render against. Swap this module for real API calls later; the
 * shapes are intentionally close to the PRD's core entities (§1.3).
 */

export type Phase = "Kickoff" | "Discovery" | "Design" | "Development" | "Launch"

export type AttentionKind = "revision" | "deliverable" | "invoice"

/** A unified "needs a response from an admin" item — the dashboard inbox. */
export type AttentionItem = {
  id: string
  kind: AttentionKind
  client: string
  project: string
  /** What happened / what's being asked. */
  title: string
  detail?: string
  /** Display status, e.g. "Requested", "Changes requested", "Overdue". */
  status: string
  urgency: "high" | "normal"
  /** Relative age, e.g. "2h", "1d". */
  age: string
  /** The verb on the row's primary action. */
  action: string
  href: string
}

export type Milestone = {
  id: string
  project: string
  client: string
  title: string
  phase: Phase
  /** Display date, e.g. "Jul 28". */
  due: string
  dueInDays: number
}

export type ProjectStatus = "on-track" | "at-risk" | "kickoff"

export type ActiveProject = {
  id: string
  name: string
  client: string
  phase: Phase
  /** 0–100. */
  progress: number
  nextMilestone?: string
  /** Display string, e.g. "$24k". */
  value: string
  /** Numeric value for sorting. */
  budget: number
  status: ProjectStatus
}

export type Delta = { label: string; direction: "up" | "down"; good: boolean }

/** A headline metric with a trend sparkline + delta — ui-test7 KPI card. */
export type DashboardKpi = {
  key: string
  label: string
  value: string
  unit?: string
  bars: number[]
  delta: Delta
  footer: string
  href: string
  accent: "lime" | "red" | "neutral"
}

export type DashboardData = {
  greetingName: string
  today: string
  kpis: DashboardKpi[]
  attention: AttentionItem[]
  milestones: Milestone[]
  projects: ActiveProject[]
}

export const DASHBOARD_DATA: DashboardData = {
  greetingName: "Tanya",
  today: "Friday, 25 July",
  kpis: [
    {
      key: "projects",
      label: "Active projects",
      value: "12",
      bars: [4, 6, 5, 7, 6, 8, 9, 8, 10, 12],
      delta: { label: "+2", direction: "up", good: true },
      footer: "vs last month",
      href: "/admin/projects",
      accent: "lime",
    },
    {
      key: "revenue",
      label: "Revenue · 30d",
      value: "$86.4",
      unit: "k",
      bars: [5, 7, 6, 8, 7, 9, 8, 11, 10, 12],
      delta: { label: "+12%", direction: "up", good: true },
      footer: "vs prev 30d",
      href: "/admin/invoices",
      accent: "lime",
    },
    {
      key: "outstanding",
      label: "Outstanding",
      value: "$48.2",
      unit: "k",
      bars: [9, 8, 10, 7, 8, 6, 7, 5, 6, 4],
      delta: { label: "-$8.0k", direction: "down", good: true },
      footer: "vs last week",
      href: "/admin/invoices",
      accent: "neutral",
    },
    {
      key: "attention",
      label: "Needs action",
      value: "10",
      bars: [3, 4, 3, 5, 4, 6, 5, 7, 8, 10],
      delta: { label: "+3", direction: "up", good: false },
      footer: "since yesterday",
      href: "/admin/revisions",
      accent: "red",
    },
  ],
  attention: [
    {
      id: "a1",
      kind: "revision",
      client: "Contoso Foods",
      project: "Site build",
      title: "New revision request — extra landing section",
      detail: "Wants an added case-studies band above the footer.",
      status: "Requested",
      urgency: "high",
      age: "2h",
      action: "Review",
      href: "/admin/revisions",
    },
    {
      id: "a2",
      kind: "deliverable",
      client: "Litware",
      project: "Identity",
      title: "Changes requested on Logo concepts v1",
      detail: "“Prefer the wordmark heavier; drop concept 3.”",
      status: "Changes requested",
      urgency: "high",
      age: "5h",
      action: "Open",
      href: "/admin/deliverables",
    },
    {
      id: "a3",
      kind: "invoice",
      client: "Northwind",
      project: "Brand refresh",
      title: "Invoice #0043 is overdue",
      detail: "$12,000 · due 5 days ago",
      status: "Overdue",
      urgency: "high",
      age: "3d",
      action: "Chase",
      href: "/admin/invoices",
    },
    {
      id: "a4",
      kind: "invoice",
      client: "Relecloud",
      project: "Campaign",
      title: "Draft invoice ready to send",
      detail: "$6,400 · milestone 2 of 3",
      status: "Draft",
      urgency: "normal",
      age: "1d",
      action: "Send",
      href: "/admin/invoices",
    },
    {
      id: "a5",
      kind: "deliverable",
      client: "Contoso Foods",
      project: "Site build",
      title: "Staging build awaiting your review",
      detail: "Ready to mark for client review.",
      status: "Ready",
      urgency: "normal",
      age: "6h",
      action: "Review",
      href: "/admin/deliverables",
    },
    {
      id: "a6",
      kind: "revision",
      client: "Northwind",
      project: "Brand refresh",
      title: "New scope — email templates",
      detail: "Deciding: new phase vs linked project.",
      status: "In review",
      urgency: "normal",
      age: "1d",
      action: "Open",
      href: "/admin/revisions",
    },
  ],
  milestones: [
    { id: "m1", project: "Brand refresh", client: "Northwind", title: "Design system handoff", phase: "Design", due: "Jul 28", dueInDays: 3 },
    { id: "m2", project: "Site build", client: "Contoso Foods", title: "Staging review", phase: "Development", due: "Jul 30", dueInDays: 5 },
    { id: "m3", project: "Identity", client: "Litware", title: "Logo concepts v2", phase: "Discovery", due: "Aug 02", dueInDays: 8 },
    { id: "m4", project: "Campaign", client: "Relecloud", title: "Launch assets", phase: "Launch", due: "Aug 05", dueInDays: 11 },
    { id: "m5", project: "Rebrand", client: "Wide World Studio", title: "Wireframes", phase: "Design", due: "Aug 06", dueInDays: 12 },
  ],
  projects: [
    { id: "p1", name: "Brand refresh", client: "Northwind", phase: "Design", progress: 62, nextMilestone: "Design system handoff", value: "$24k", budget: 24000, status: "on-track" },
    { id: "p2", name: "Site build", client: "Contoso Foods", phase: "Development", progress: 45, nextMilestone: "Staging review", value: "$52k", budget: 52000, status: "at-risk" },
    { id: "p3", name: "Identity", client: "Litware", phase: "Discovery", progress: 20, nextMilestone: "Logo concepts v2", value: "$12k", budget: 12000, status: "on-track" },
    { id: "p4", name: "Campaign", client: "Relecloud", phase: "Launch", progress: 88, nextMilestone: "Launch assets", value: "$18k", budget: 18000, status: "on-track" },
    { id: "p5", name: "Rebrand", client: "Wide World Studio", phase: "Kickoff", progress: 5, nextMilestone: "Wireframes", value: "$30k", budget: 30000, status: "kickoff" },
    { id: "p6", name: "Packaging", client: "VanArsdel", phase: "Design", progress: 40, nextMilestone: "Dieline review", value: "$16k", budget: 16000, status: "on-track" },
    { id: "p7", name: "Web app", client: "Proseware", phase: "Development", progress: 55, nextMilestone: "Beta cut", value: "$64k", budget: 64000, status: "at-risk" },
    { id: "p8", name: "Motion reel", client: "Fabrikam", phase: "Design", progress: 72, nextMilestone: "Animatic sign-off", value: "$9k", budget: 9000, status: "on-track" },
    { id: "p9", name: "Naming", client: "Tailspin", phase: "Discovery", progress: 15, nextMilestone: "Shortlist", value: "$6k", budget: 6000, status: "on-track" },
  ],
}

/** Fresh studio — no clients onboarded yet. Drives the empty state. */
export const EMPTY_DASHBOARD_DATA: DashboardData = {
  greetingName: "Tanya",
  today: "Friday, 25 July",
  kpis: [],
  attention: [],
  milestones: [],
  projects: [],
}

export function hasDashboardData(data: DashboardData) {
  return data.projects.length > 0
}
