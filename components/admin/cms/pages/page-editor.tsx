"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getPage, type PageBlock } from "@/lib/mock/cms"
import { useCmsPublish } from "@/components/admin/cms/publish-context"
import { EditorScaffold } from "@/components/admin/cms/editor-shell"

/**
 * Page editor — edits the copy blocks of one marketing page. Headings are single
 * lines; text and rich-text blocks are multiline (a real rich-text editor would
 * slot in here). Save draft is instant; Publish kicks off a Vercel rebuild.
 */
export function PageEditor({ id }: { id: string }) {
  const router = useRouter()
  const { publish } = useCmsPublish()
  const page = getPage(id)

  const [blocks, setBlocks] = React.useState<PageBlock[]>(page?.blocks ?? [])

  if (!page) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Page not found.</p>
        <Button variant="outline" render={<Link href="/admin/cms/pages" />}>
          Go to pages
        </Button>
      </div>
    )
  }

  const setBlock = (blockId: string, value: string) =>
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, value } : b)))

  const valid = blocks.every((b) => b.value.trim().length > 0)

  const saveDraft = () => {
    toast.success(`Saved “${page.title}” as draft`)
    router.push("/admin/cms/pages")
  }
  const doPublish = () => {
    publish(`Published ${page.title}`)
    router.push("/admin/cms")
  }

  return (
    <EditorScaffold
      title={page.title}
      status={page.status}
      pendingChanges={page.pendingChanges}
      livePath={page.path}
      valid={valid}
      onSaveDraft={saveDraft}
      onPublish={doPublish}
    >
      <p className="mb-6 text-sm text-muted-foreground">{page.description}</p>
      <div className="flex flex-col gap-5">
        {blocks.map((b) => (
          <div key={b.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={b.id}>{b.label}</Label>
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
                {b.type}
              </span>
            </div>
            {b.type === "heading" ? (
              <Input
                id={b.id}
                value={b.value}
                onChange={(e) => setBlock(b.id, e.target.value)}
              />
            ) : (
              <Textarea
                id={b.id}
                value={b.value}
                onChange={(e) => setBlock(b.id, e.target.value)}
                className={b.type === "richtext" ? "min-h-32" : "min-h-20"}
              />
            )}
          </div>
        ))}
      </div>
    </EditorScaffold>
  )
}
