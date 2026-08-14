"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Add01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  RocketIcon,
  EyeIcon,
  ViewOffSlashIcon,
  LinkSquare02Icon,
  Loading03Icon,
  PencilEdit02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  usePage,
  useUpdatePage,
  useDeletePage,
  useCreateBlock,
  useUpdateBlock,
  useReorderBlocks,
  useDeleteBlock,
} from "@/lib/queries/cms-queries"
import { PageStatusBadge } from "@/components/admin/cms/parts"
import {
  BLOCK_TYPES,
  BLOCK_META,
  BlockFields,
  blockSummary,
  defaultContent,
} from "@/components/admin/cms/pages/block-kit"
import type { Page, PageBlock, PageBlockType, PageInput } from "@/lib/api/models"

/**
 * Page editor — edits one marketing page's SEO metadata and its ordered blocks.
 * Blocks are server resources: add / edit / reorder / show-hide / delete each hit
 * the API and refetch the page. "Publish" is the API's `isPublished` flag.
 */
export function PageEditor({ id }: { id: string }) {
  const { data: page, isLoading, isError } = usePage(id)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (isError || !page) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Page not found.</p>
        <Button variant="outline" render={<Link href="/admin/cms/pages" />}>
          Go to pages
        </Button>
      </div>
    )
  }

  return <PageEditorInner key={page.id} page={page} />
}

function PageEditorInner({ page }: { page: Page }) {
  const router = useRouter()
  const updatePage = useUpdatePage()
  const deletePage = useDeletePage()
  const createBlock = useCreateBlock()
  const updateBlock = useUpdateBlock()
  const reorderBlocks = useReorderBlocks()
  const deleteBlock = useDeleteBlock()

  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [meta, setMeta] = React.useState(() => ({
    title: page.title,
    slug: page.slug,
    description: page.description ?? "",
    metaTitle: page.metaTitle ?? "",
    metaDesc: page.metaDesc ?? "",
  }))

  const blocks = React.useMemo(
    () => [...page.blocks].sort((a, b) => a.order - b.order),
    [page.blocks]
  )

  const metaValid = meta.title.trim().length > 0 && meta.slug.trim().length > 0

  const buildInput = (overrides?: Partial<PageInput>): PageInput => ({
    title: meta.title.trim(),
    slug: meta.slug.trim(),
    description: meta.description.trim() || undefined,
    metaTitle: meta.metaTitle.trim() || undefined,
    metaDesc: meta.metaDesc.trim() || undefined,
    isPublished: page.isPublished,
    ...overrides,
  })

  const savePage = () => {
    if (!metaValid) return
    updatePage.mutate({ id: page.id, input: buildInput() })
  }

  const togglePublish = () =>
    updatePage.mutate({ id: page.id, input: buildInput({ isPublished: !page.isPublished }) })

  const addBlock = (type: PageBlockType) =>
    createBlock.mutate({
      pageId: page.id,
      input: { type, content: defaultContent(type), order: blocks.length },
    })

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= blocks.length) return
    const ids = blocks.map((b) => b.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorderBlocks.mutate({ pageId: page.id, blockIds: ids })
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <Link
            href="/admin/cms/pages"
            aria-label="Back to pages"
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight">{page.title}</h1>
              <PageStatusBadge isPublished={page.isPublished} />
            </div>
            {page.isPublished && (
              <a
                href={`https://cloverdesign.xyz/${page.slug === "home" ? "" : page.slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
                cloverdesign.xyz/{page.slug === "home" ? "" : page.slug}
              </a>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={savePage} disabled={!metaValid || updatePage.isPending}>
            Save
          </Button>
          <Button className="gap-1.5" onClick={togglePublish} disabled={updatePage.isPending}>
            <HugeiconsIcon icon={RocketIcon} data-icon="inline-start" className="size-4" />
            {page.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Page actions"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                <HugeiconsIcon icon={Delete02Icon} />
                Delete page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Page settings */}
      <section className="mt-6 space-y-4">
        <h2 className="font-heading text-sm font-medium">Page settings</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={meta.title}
              onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={meta.slug}
              onChange={(e) => setMeta((m) => ({ ...m, slug: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={meta.description}
            onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
            className="min-h-16"
            placeholder="Internal description of this page."
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="metaTitle">Meta title (SEO)</Label>
            <Input
              id="metaTitle"
              value={meta.metaTitle}
              onChange={(e) => setMeta((m) => ({ ...m, metaTitle: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metaDesc">Meta description (SEO)</Label>
            <Input
              id="metaDesc"
              value={meta.metaDesc}
              onChange={(e) => setMeta((m) => ({ ...m, metaDesc: e.target.value }))}
            />
          </div>
        </div>
      </section>

      {/* Blocks */}
      <section className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-medium">
            Content{" "}
            <span className="text-muted-foreground">
              ({blocks.length} block{blocks.length === 1 ? "" : "s"})
            </span>
          </h2>
          <AddBlockMenu onAdd={addBlock} disabled={createBlock.isPending} />
        </div>

        {blocks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
            <p className="text-sm text-muted-foreground">No blocks yet.</p>
            <AddBlockMenu onAdd={addBlock} disabled={createBlock.isPending} label="Add a block" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {blocks.map((block, index) => (
              <BlockCard
                key={block.id}
                block={block}
                index={index}
                total={blocks.length}
                onMove={move}
                onToggleVisible={() =>
                  updateBlock.mutate({
                    pageId: page.id,
                    blockId: block.id,
                    input: { isVisible: !block.isVisible },
                  })
                }
                onDelete={() =>
                  deleteBlock.mutate({ pageId: page.id, blockId: block.id })
                }
                onSaveContent={(content, done) =>
                  updateBlock.mutate(
                    { pageId: page.id, blockId: block.id, input: { content } },
                    { onSuccess: done }
                  )
                }
                saving={updateBlock.isPending}
              />
            ))}
          </div>
        )}
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{page.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the page and all its blocks. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                deletePage.mutate(page.id, {
                  onSuccess: () => {
                    setConfirmOpen(false)
                    router.push("/admin/cms/pages")
                  },
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* --------------------------------------------------------------- add-block menu */

function AddBlockMenu({
  onAdd,
  disabled,
  label = "Add block",
}: {
  onAdd: (type: PageBlockType) => void
  disabled?: boolean
  label?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" variant="outline" className="gap-1.5" disabled={disabled} />
        }
      >
        <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-3.5" />
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Add block</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {BLOCK_TYPES.map((b) => (
          <DropdownMenuItem key={b.type} onClick={() => onAdd(b.type)}>
            <HugeiconsIcon icon={b.icon} />
            <span className="flex-1">{b.label}</span>
            <span className="text-xs text-muted-foreground">{b.hint}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------- block card */

function BlockCard({
  block,
  index,
  total,
  onMove,
  onToggleVisible,
  onDelete,
  onSaveContent,
  saving,
}: {
  block: PageBlock
  index: number
  total: number
  onMove: (index: number, dir: -1 | 1) => void
  onToggleVisible: () => void
  onDelete: () => void
  onSaveContent: (content: Record<string, unknown>, done: () => void) => void
  saving: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<Record<string, unknown>>(block.content)
  const meta = BLOCK_META[block.type]

  const openEditor = () => {
    setDraft(block.content)
    setOpen(true)
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-colors",
        !block.isVisible && "opacity-60"
      )}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Reorder */}
        <div className="flex flex-col">
          <button
            type="button"
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
            className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={index === total - 1}
            onClick={() => onMove(index, 1)}
            className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
          </button>
        </div>

        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <HugeiconsIcon icon={meta.icon} className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{meta.label}</span>
            {!block.isVisible && (
              <span className="text-xs text-muted-foreground">Hidden</span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {blockSummary(block.type, block.content)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label={block.isVisible ? "Hide block" : "Show block"}
            onClick={onToggleVisible}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={block.isVisible ? EyeIcon : ViewOffSlashIcon} className="size-4" />
          </button>
          <button
            type="button"
            aria-label={open ? "Close editor" : "Edit block"}
            onClick={() => (open ? setOpen(false) : openEditor())}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={open ? Cancel01Icon : PencilEdit02Icon} className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Delete block"
            onClick={onDelete}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <BlockFields type={block.type} content={draft} onChange={setDraft} />
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => onSaveContent(draft, () => setOpen(false))}
              disabled={saving}
            >
              Save block
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
