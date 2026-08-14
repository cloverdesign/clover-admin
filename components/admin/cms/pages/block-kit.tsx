"use client"

import * as React from "react"
import {
  Heading01Icon,
  ParagraphIcon,
  Image01Icon,
  PlayCircleIcon,
  CursorMagicSelection01Icon,
  MinusSignIcon,
  CodeIcon,
  DistributeVerticalCenterIcon,
  Layout01Icon,
} from "@hugeicons/core-free-icons"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { PageBlockType } from "@/lib/api/models"

/**
 * Block kit — the per-type metadata and field editors the page block editor is
 * built on. The API stores `content` as a free-form object (`Record<string,
 * unknown>`), so these conventions are the admin's contract for each block type;
 * `COLUMNS` and any unknown type fall back to a raw-JSON editor.
 */

type IconGlyph = typeof Heading01Icon

export const BLOCK_TYPES: {
  type: PageBlockType
  label: string
  icon: IconGlyph
  hint: string
}[] = [
  { type: "HEADING", label: "Heading", icon: Heading01Icon, hint: "Section title" },
  { type: "TEXT", label: "Text", icon: ParagraphIcon, hint: "Paragraph copy" },
  { type: "IMAGE", label: "Image", icon: Image01Icon, hint: "Image with alt + caption" },
  { type: "VIDEO", label: "Video", icon: PlayCircleIcon, hint: "Embedded video URL" },
  { type: "BUTTON", label: "Button", icon: CursorMagicSelection01Icon, hint: "Call-to-action link" },
  { type: "EMBED", label: "Embed", icon: CodeIcon, hint: "Raw HTML / embed code" },
  { type: "DIVIDER", label: "Divider", icon: MinusSignIcon, hint: "Horizontal rule" },
  { type: "SPACER", label: "Spacer", icon: DistributeVerticalCenterIcon, hint: "Vertical gap" },
  { type: "COLUMNS", label: "Columns", icon: Layout01Icon, hint: "Multi-column (raw)" },
]

export const BLOCK_META: Record<
  PageBlockType,
  { label: string; icon: IconGlyph }
> = Object.fromEntries(
  BLOCK_TYPES.map((b) => [b.type, { label: b.label, icon: b.icon }])
) as Record<PageBlockType, { label: string; icon: IconGlyph }>

/** Fresh content for a newly added block of `type`. */
export function defaultContent(type: PageBlockType): Record<string, unknown> {
  switch (type) {
    case "HEADING":
      return { text: "", level: 2 }
    case "TEXT":
      return { text: "" }
    case "IMAGE":
      return { src: "", alt: "", href: "" }
    case "VIDEO":
      return { src: "", poster: "" }
    case "BUTTON":
      return { label: "", href: "" }
    case "EMBED":
      return { embed_url: "" }
    case "SPACER":
      return { height: 48 }
    case "DIVIDER":
      return {}
    default:
      return {}
  }
}

const str = (c: Record<string, unknown>, k: string): string =>
  typeof c[k] === "string" ? (c[k] as string) : ""

/** One-line preview of a block's content, for the block list. */
export function blockSummary(type: PageBlockType, content: Record<string, unknown>): string {
  switch (type) {
    case "HEADING":
    case "TEXT":
      return str(content, "text") || "Empty"
    case "IMAGE":
      return str(content, "src") || "No image set"
    case "VIDEO":
      return str(content, "src") || "No video set"
    case "BUTTON": {
      const label = str(content, "label")
      const href = str(content, "href")
      return label ? `${label} → ${href || "#"}` : "No label"
    }
    case "EMBED":
      return str(content, "embed_url") || "No embed URL"
    case "SPACER":
      return `${Number(content.height) || 0}px gap`
    case "DIVIDER":
      return "Horizontal rule"
    default:
      return "Custom content"
  }
}

/* --------------------------------------------------------------- field editor */

/** Raw JSON editor for COLUMNS / unknown block types — validates on the fly and
 * only propagates a parsed object; surfaces a parse error otherwise. */
function RawContentField({
  content,
  onChange,
}: {
  content: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
}) {
  const [text, setText] = React.useState(() => JSON.stringify(content, null, 2))
  const [error, setError] = React.useState<string | null>(null)

  return (
    <div className="space-y-1.5">
      <Label>Content (JSON)</Label>
      <Textarea
        value={text}
        spellCheck={false}
        className="min-h-40 font-mono text-xs"
        onChange={(e) => {
          const value = e.target.value
          setText(value)
          try {
            const parsed = JSON.parse(value)
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              setError(null)
              onChange(parsed as Record<string, unknown>)
            } else {
              setError("Content must be a JSON object.")
            }
          } catch {
            setError("Invalid JSON.")
          }
        }}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

/** Per-type field editor. Emits the full next content object on any change. */
export function BlockFields({
  type,
  content,
  onChange,
}: {
  type: PageBlockType
  content: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
}) {
  const set = (patch: Record<string, unknown>) => onChange({ ...content, ...patch })

  switch (type) {
    case "HEADING":
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Text</Label>
            <Input
              value={str(content, "text")}
              onChange={(e) => set({ text: e.target.value })}
              placeholder="Section heading"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Level</Label>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((lvl) => {
                const active = (Number(content.level) || 2) === lvl
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => set({ level: lvl })}
                    className={
                      "flex h-9 w-12 items-center justify-center rounded-md border text-sm font-medium transition-colors " +
                      (active
                        ? "border-foreground bg-foreground text-background"
                        : "border-input text-muted-foreground hover:bg-muted")
                    }
                  >
                    H{lvl}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )

    case "TEXT":
      return (
        <div className="space-y-1.5">
          <Label>Text</Label>
          <Textarea
            value={str(content, "text")}
            onChange={(e) => set({ text: e.target.value })}
            className="min-h-28"
            placeholder="Paragraph copy…"
          />
        </div>
      )

    case "IMAGE":
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Image URL</Label>
            <Input
              value={str(content, "src")}
              onChange={(e) => set({ src: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Alt text</Label>
            <Input
              value={str(content, "alt")}
              onChange={(e) => set({ alt: e.target.value })}
              placeholder="Describe the image"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Link (optional)</Label>
            <Input
              value={str(content, "href")}
              onChange={(e) => set({ href: e.target.value })}
              placeholder="Wrap the image in a link"
            />
          </div>
        </div>
      )

    case "VIDEO":
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Video URL</Label>
            <Input
              value={str(content, "src")}
              onChange={(e) => set({ src: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Poster image (optional)</Label>
            <Input
              value={str(content, "poster")}
              onChange={(e) => set({ poster: e.target.value })}
              placeholder="https://…"
            />
          </div>
        </div>
      )

    case "BUTTON":
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Label</Label>
            <Input
              value={str(content, "label")}
              onChange={(e) => set({ label: e.target.value })}
              placeholder="Get in touch"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Link</Label>
            <Input
              value={str(content, "href")}
              onChange={(e) => set({ href: e.target.value })}
              placeholder="/contact"
            />
          </div>
        </div>
      )

    case "EMBED":
      return (
        <div className="space-y-1.5">
          <Label>Embed URL</Label>
          <Input
            value={str(content, "embed_url")}
            onChange={(e) => set({ embed_url: e.target.value })}
            placeholder="https://… (YouTube, Vimeo, Figma, …)"
          />
        </div>
      )

    case "SPACER":
      return (
        <div className="space-y-1.5">
          <Label>Height (px)</Label>
          <Input
            type="number"
            min={0}
            value={String(Number(content.height) || 0)}
            onChange={(e) => set({ height: Number(e.target.value) || 0 })}
            className="w-32"
          />
        </div>
      )

    case "DIVIDER":
      return (
        <p className="text-sm text-muted-foreground">
          A horizontal rule — no options.
        </p>
      )

    default:
      return <RawContentField content={content} onChange={onChange} />
  }
}
