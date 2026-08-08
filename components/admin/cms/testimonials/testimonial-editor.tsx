"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/admin/clients/new-client/fields"
import { getTestimonial } from "@/lib/mock/cms"
import { useCmsPublish } from "@/components/admin/cms/publish-context"
import { EditorScaffold } from "@/components/admin/cms/editor-shell"

/** Testimonial editor — create or edit a client quote. */
export function TestimonialEditor({ id }: { id?: string }) {
  const router = useRouter()
  const { publish } = useCmsPublish()
  const existing = id ? getTestimonial(id) : undefined
  const isNew = !id

  const [quote, setQuote] = React.useState(existing?.quote ?? "")
  const [author, setAuthor] = React.useState(existing?.author ?? "")
  const [role, setRole] = React.useState(existing?.role ?? "")
  const [company, setCompany] = React.useState(existing?.company ?? "")

  if (id && !existing) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Testimonial not found.</p>
        <Button variant="outline" render={<Link href="/admin/cms/testimonials" />}>
          Go to testimonials
        </Button>
      </div>
    )
  }

  const valid = quote.trim().length > 0 && author.trim().length > 0 && company.trim().length > 0

  const saveDraft = () => {
    toast.success(isNew ? "Created testimonial as draft" : "Saved testimonial as draft")
    router.push("/admin/cms/testimonials")
  }
  const doPublish = () => {
    publish(`Published testimonial from ${author}`)
    router.push("/admin/cms")
  }
  const remove = () => {
    toast.success("Deleted testimonial")
    router.push("/admin/cms/testimonials")
  }

  return (
    <EditorScaffold
      title={isNew ? "New testimonial" : existing!.author}
      status={existing?.status ?? "DRAFT"}
      pendingChanges={existing?.pendingChanges}
      valid={valid}
      onSaveDraft={saveDraft}
      onPublish={doPublish}
      onDelete={isNew ? undefined : remove}
    >
      <div className="flex flex-col gap-4">
        <Field label="Quote" htmlFor="t-quote">
          <Textarea
            id="t-quote"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            className="min-h-28"
            placeholder="What the client said…"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Author" htmlFor="t-author">
            <Input id="t-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Dana Okafor" />
          </Field>
          <Field label="Role" htmlFor="t-role">
            <Input id="t-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Head of Marketing" />
          </Field>
          <Field label="Company" htmlFor="t-company">
            <Input id="t-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Atlas Foods" />
          </Field>
        </div>
      </div>
    </EditorScaffold>
  )
}
