"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCreatePage } from "@/lib/queries/cms-queries"

/** kebab-case slug from a title. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * New page — scaffolds a marketing-site page (title, slug, description) then
 * drops into the block editor. Slug auto-fills from the title until edited by
 * hand.
 */
export function NewPagePage() {
  const router = useRouter()
  const createPage = useCreatePage()

  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [slugTouched, setSlugTouched] = React.useState(false)
  const [description, setDescription] = React.useState("")

  const effectiveSlug = slugTouched ? slug : slugify(title)
  const valid = title.trim().length > 0 && effectiveSlug.length > 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    createPage.mutate(
      {
        title: title.trim(),
        slug: effectiveSlug,
        description: description.trim() || undefined,
      },
      {
        onSuccess: (page) => router.push(`/admin/cms/pages/${page.id}`),
      }
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/admin/cms/pages"
          aria-label="Back to pages"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">New page</h1>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:p-6">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="About"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">/</span>
            <Input
              id="slug"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(slugify(e.target.value))
              }}
              placeholder="about"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The path on the live site, e.g. <span className="font-mono">/about</span>.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-20"
            placeholder="What this page is for (internal)."
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" render={<Link href="/admin/cms/pages" />}>
            Cancel
          </Button>
          <Button type="submit" disabled={!valid || createPage.isPending}>
            {createPage.isPending ? "Creating…" : "Create page"}
          </Button>
        </div>
      </form>
    </div>
  )
}
