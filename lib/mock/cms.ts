/**
 * Typed dummy data for the Site CMS (PRD Module 2). This is the admin surface
 * for the public marketing site — pages, case studies, testimonials, a media
 * library and site-wide settings. Each content item is either PUBLISHED or a
 * DRAFT, and a published item can carry unpublished edits (`pendingChanges`).
 *
 * The marketing site is static on Vercel, so "Publish" triggers a deploy hook
 * and a rebuild rather than going live instantly — modelled here by `DEPLOY`
 * plus a simulated build in `publish-context.tsx`. Swap for a real CMS/deploy
 * API later.
 */

export type ContentStatus = "PUBLISHED" | "DRAFT"

/** A single editable field on a page (headline, paragraph, rich text block). */
export type PageBlock = {
  id: string
  label: string
  type: "heading" | "text" | "richtext"
  value: string
}

export type CmsPage = {
  id: string
  title: string
  /** URL path on the live site, e.g. "/about". */
  path: string
  description: string
  blocks: PageBlock[]
  status: ContentStatus
  /** Published, but edited since — a deploy would push these live. */
  pendingChanges: boolean
  updatedAt: string
  publishedAt: string | null
}

export type CaseStudy = {
  id: string
  title: string
  slug: string
  client: string
  tags: string[]
  excerpt: string
  body: string
  /** Placeholder swatch for the cover (no real uploads in the mock). */
  coverColor: string
  status: ContentStatus
  pendingChanges: boolean
  updatedAt: string
  publishedAt: string | null
}

export type Testimonial = {
  id: string
  quote: string
  author: string
  role: string
  company: string
  status: ContentStatus
  pendingChanges: boolean
  updatedAt: string
}

export type MediaAsset = {
  id: string
  name: string
  /** Placeholder swatch — the mock has no real image bytes. */
  color: string
  width: number
  height: number
  sizeBytes: number
  uploadedAt: string
  /** Pages / entries this asset is used on. */
  usedOn: string[]
}

export type SocialLinks = {
  instagram: string
  linkedin: string
  x: string
}

export type SiteSettings = {
  contactEmail: string
  phone: string
  socials: SocialLinks
  footerText: string
}

export type DeployStatus = "LIVE" | "QUEUED" | "BUILDING" | "ERROR"

export type Deploy = {
  id: string
  status: DeployStatus
  /** ISO date-time of the deploy. */
  at: string
  /** What triggered it, for the activity line. */
  trigger: string
}

/* ------------------------------------------------------------------ pages */

export const PAGES: CmsPage[] = [
  {
    id: "pg-home",
    title: "Home",
    path: "/",
    description: "The landing page — hero, selected work and the studio pitch.",
    blocks: [
      { id: "b1", label: "Hero headline", type: "heading", value: "Design that moves brands forward." },
      { id: "b2", label: "Hero subtext", type: "text", value: "Clover is a design studio building brands, sites and products for ambitious teams." },
      { id: "b3", label: "Intro", type: "richtext", value: "We partner with founders and marketing leads from first idea through launch — identity, websites, and the systems that keep them consistent." },
    ],
    status: "PUBLISHED",
    pendingChanges: true,
    updatedAt: "2024-08-02",
    publishedAt: "2024-07-15",
  },
  {
    id: "pg-about",
    title: "About",
    path: "/about",
    description: "Studio story, team and values.",
    blocks: [
      { id: "b1", label: "Page title", type: "heading", value: "A small studio with a wide range." },
      { id: "b2", label: "Story", type: "richtext", value: "Founded in 2019, Clover is a team of eight designers and engineers working across brand, web and product." },
    ],
    status: "PUBLISHED",
    pendingChanges: false,
    updatedAt: "2024-06-20",
    publishedAt: "2024-06-20",
  },
  {
    id: "pg-services",
    title: "Services",
    path: "/services",
    description: "What we offer — branding, websites, product design.",
    blocks: [
      { id: "b1", label: "Page title", type: "heading", value: "What we do." },
      { id: "b2", label: "Services intro", type: "richtext", value: "Three practices, one team: Brand, Web, and Product. Most engagements blend all three." },
    ],
    status: "DRAFT",
    pendingChanges: false,
    updatedAt: "2024-08-01",
    publishedAt: null,
  },
  {
    id: "pg-contact",
    title: "Contact",
    path: "/contact",
    description: "Contact form and studio details.",
    blocks: [
      { id: "b1", label: "Page title", type: "heading", value: "Let's talk." },
      { id: "b2", label: "Blurb", type: "text", value: "Tell us about your project and we'll get back within two business days." },
    ],
    status: "PUBLISHED",
    pendingChanges: false,
    updatedAt: "2024-05-10",
    publishedAt: "2024-05-10",
  },
]

/* ----------------------------------------------------------- case studies */

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "cs-atlas",
    title: "Rebuilding Atlas Foods for scale",
    slug: "atlas-foods",
    client: "Atlas Foods",
    tags: ["Website", "Branding"],
    excerpt: "A new design system and headless site for a growing food brand.",
    body: "Atlas Foods came to us ahead of a national rollout. We rebuilt their marketing site on a new design system with a headless CMS so their team could publish without engineering.",
    coverColor: "#3b5b3b",
    status: "PUBLISHED",
    pendingChanges: false,
    updatedAt: "2024-07-01",
    publishedAt: "2024-07-01",
  },
  {
    id: "cs-harbor",
    title: "A calmer web presence for Harbor & Co",
    slug: "harbor-and-co",
    client: "Harbor & Co",
    tags: ["Website"],
    excerpt: "Marketing site for a boutique maritime law firm.",
    body: "Harbor & Co needed a site that felt as considered as their practice. We delivered a restrained, editorial marketing site that converts.",
    coverColor: "#2b3a4a",
    status: "PUBLISHED",
    pendingChanges: true,
    updatedAt: "2024-08-03",
    publishedAt: "2024-04-12",
  },
  {
    id: "cs-fable",
    title: "A motion system for Fable's launch",
    slug: "fable-motion",
    client: "Fable",
    tags: ["Motion", "Branding"],
    excerpt: "Sizzle reel and motion language for a streaming launch.",
    body: "We built a flexible motion system — logo animation, transitions and a launch sizzle — that Fable's team can extend.",
    coverColor: "#4a2b46",
    status: "DRAFT",
    pendingChanges: false,
    updatedAt: "2024-08-04",
    publishedAt: null,
  },
]

/* ------------------------------------------------------------ testimonials */

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-atlas",
    quote: "Clover rebuilt our site and brand in a quarter and our team can finally publish on our own.",
    author: "Dana Okafor",
    role: "Head of Marketing",
    company: "Atlas Foods",
    status: "PUBLISHED",
    pendingChanges: false,
    updatedAt: "2024-07-02",
  },
  {
    id: "t-harbor",
    quote: "The most considered studio we've worked with. Every detail earned its place.",
    author: "Ellis Marsh",
    role: "Partner",
    company: "Harbor & Co",
    status: "PUBLISHED",
    pendingChanges: false,
    updatedAt: "2024-04-15",
  },
  {
    id: "t-northwind",
    quote: "They understood our raise timeline and delivered a brand that punched above our size.",
    author: "Priya Raman",
    role: "CEO",
    company: "Northwind",
    status: "DRAFT",
    pendingChanges: false,
    updatedAt: "2024-08-01",
  },
]

/* ------------------------------------------------------------------ media */

export const MEDIA: MediaAsset[] = [
  { id: "m-1", name: "atlas-hero.jpg", color: "#3b5b3b", width: 2400, height: 1350, sizeBytes: 840_000, uploadedAt: "2024-07-01", usedOn: ["Home", "Atlas Foods"] },
  { id: "m-2", name: "harbor-cover.jpg", color: "#2b3a4a", width: 2000, height: 1250, sizeBytes: 610_000, uploadedAt: "2024-04-12", usedOn: ["Harbor & Co"] },
  { id: "m-3", name: "fable-still-01.jpg", color: "#4a2b46", width: 1920, height: 1080, sizeBytes: 720_000, uploadedAt: "2024-08-04", usedOn: [] },
  { id: "m-4", name: "studio-team.jpg", color: "#4a442b", width: 2400, height: 1600, sizeBytes: 1_240_000, uploadedAt: "2024-06-18", usedOn: ["About"] },
  { id: "m-5", name: "clover-mark.svg", color: "#3d4a2b", width: 512, height: 512, sizeBytes: 12_000, uploadedAt: "2024-01-10", usedOn: ["Home", "About", "Services", "Contact"] },
  { id: "m-6", name: "services-diagram.png", color: "#2b3f4a", width: 1600, height: 900, sizeBytes: 340_000, uploadedAt: "2024-08-01", usedOn: [] },
]

/* ---------------------------------------------------------------- settings */

export const SITE_SETTINGS: SiteSettings = {
  contactEmail: "hello@cloverdesign.xyz",
  phone: "+1 (415) 555-0134",
  socials: {
    instagram: "https://instagram.com/cloverstudio",
    linkedin: "https://linkedin.com/company/cloverstudio",
    x: "https://x.com/cloverstudio",
  },
  footerText: "© Clover Design Studio. All rights reserved.",
}

/* ------------------------------------------------------------------ deploy */

/** Current live deploy — the starting state for the publish simulation. */
export const DEPLOY: Deploy = {
  id: "dpl-8f21",
  status: "LIVE",
  at: "2024-08-02",
  trigger: "Published Home",
}

/* ----------------------------------------------------------------- helpers */

export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
}

export const CONTENT_STATUS_VARIANT: Record<
  ContentStatus,
  "success" | "warning"
> = {
  PUBLISHED: "success",
  DRAFT: "warning",
}

export const DEPLOY_STATUS_LABEL: Record<DeployStatus, string> = {
  LIVE: "Live",
  QUEUED: "Queued",
  BUILDING: "Building",
  ERROR: "Failed",
}

export function getPage(id: string): CmsPage | undefined {
  return PAGES.find((p) => p.id === id)
}

export function getCaseStudy(id: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.id === id)
}

export function getTestimonial(id: string): Testimonial | undefined {
  return TESTIMONIALS.find((t) => t.id === id)
}

/** An item contributes an "unpublished change" if it's a draft or edited-since. */
function isUnpublished(item: { status: ContentStatus; pendingChanges?: boolean }): boolean {
  return item.status === "DRAFT" || Boolean(item.pendingChanges)
}

/** Total pending changes across all content — drives the Publish affordance. */
export function unpublishedCount(): number {
  return [
    ...PAGES,
    ...CASE_STUDIES,
    ...TESTIMONIALS,
  ].filter(isUnpublished).length
}

export type ContentKind = "page" | "case-study" | "testimonial"

export type RecentChange = {
  id: string
  kind: ContentKind
  title: string
  status: ContentStatus
  pendingChanges: boolean
  updatedAt: string
  href: string
}

/** Most-recently-edited content across every type, for the hub feed. */
export function recentChanges(limit = 6): RecentChange[] {
  const rows: RecentChange[] = [
    ...PAGES.map((p) => ({
      id: p.id, kind: "page" as const, title: p.title, status: p.status,
      pendingChanges: p.pendingChanges, updatedAt: p.updatedAt,
      href: `/admin/cms/pages/${p.id}`,
    })),
    ...CASE_STUDIES.map((c) => ({
      id: c.id, kind: "case-study" as const, title: c.title, status: c.status,
      pendingChanges: c.pendingChanges, updatedAt: c.updatedAt,
      href: `/admin/cms/case-studies/${c.id}`,
    })),
    ...TESTIMONIALS.map((t) => ({
      id: t.id, kind: "testimonial" as const, title: t.author, status: t.status,
      pendingChanges: t.pendingChanges, updatedAt: t.updatedAt,
      href: `/admin/cms/testimonials/${t.id}`,
    })),
  ]
  return rows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, limit)
}

export const CONTENT_KIND_LABEL: Record<ContentKind, string> = {
  page: "Page",
  "case-study": "Case study",
  testimonial: "Testimonial",
}

/** Human file size, e.g. "840 KB". */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "—"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, i)
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}
