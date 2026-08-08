"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/admin/clients/new-client/fields"
import { getCaseStudy } from "@/lib/mock/cms"
import { useCmsPublish } from "@/components/admin/cms/publish-context"
import { EditorScaffold } from "@/components/admin/cms/editor-shell"

/**
 * Case study editor — create or edit a portfolio entry. When `id` is omitted
 * it's a new entry (starts as a draft). Save draft is instant; Publish triggers
 * a rebuild. Cover art is a placeholder swatch — no real uploads in the mock.
 */
export function CaseStudyEditor({ id }: { id?: string }) {
  const router = useRouter()
  const { publish } = useCmsPublish()
  const existing = id ? getCaseStudy(id) : undefined
  const isNew = !id

  const [title, setTitle] = React.useState(existing?.title ?? "")
  const [client, setClient] = React.useState(existing?.client ?? "")
  const [tags, setTags] = React.useState(existing?.tags.join(", ") ?? "")
  const [excerpt, setExcerpt] = React.useState(existing?.excerpt ?? "")
  const [body, setBody] = React.useState(existing?.body ?? "")

  if (id && !existing) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Case study not found.</p>
        <Button variant="outline" render={<Link href="/admin/cms/case-studies" />}>
          Go to case studies
        </Button>
      </div>
    )
  }

  const valid = title.trim().length > 0 && client.trim().length > 0 && excerpt.trim().length > 0

  const saveDraft = () => {
    toast.success(isNew ? `Created “${title}” as draft` : `Saved “${title}” as draft`)
    router.push("/admin/cms/case-studies")
  }
  const doPublish = () => {
    publish(`Published ${title}`)
    router.push("/admin/cms")
  }
  const remove = () => {
    toast.success(`Deleted “${existing?.title}”`)
    router.push("/admin/cms/case-studies")
  }

  return (
    <EditorScaffold
      title={isNew ? "New case study" : existing!.title}
      status={existing?.status ?? "DRAFT"}
      pendingChanges={existing?.pendingChanges}
      livePath={existing ? `/work/${existing.slug}` : undefined}
      valid={valid}
      onSaveDraft={saveDraft}
      onPublish={doPublish}
      onDelete={isNew ? undefined : remove}
    >
      <div className="flex flex-col gap-4">
        {/* Cover placeholder */}
        <div
          className="flex aspect-[16/6] items-center justify-center rounded-2xl border text-xs text-white/70"
          style={{ backgroundColor: existing?.coverColor ?? "#3b3b3b" }}
        >
          Cover image
        </div>

        <Field label="Title" htmlFor="cs-title">
          <Input id="cs-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rebuilding Atlas Foods for scale" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Client" htmlFor="cs-client">
            <Input id="cs-client" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Atlas Foods" />
          </Field>
          <Field label="Tags" htmlFor="cs-tags" hint="Comma-separated.">
            <Input id="cs-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Website, Branding" />
          </Field>
        </div>
        <Field label="Excerpt" htmlFor="cs-excerpt" hint="One line shown on the work index.">
          <Textarea id="cs-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="min-h-16" />
        </Field>
        <Field label="Body" htmlFor="cs-body">
          <Textarea id="cs-body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-40" />
        </Field>
      </div>
    </EditorScaffold>
  )
}
