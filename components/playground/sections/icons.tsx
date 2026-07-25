"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  Home03Icon,
  Menu01Icon,
  SidebarLeft01Icon,
  GridViewIcon,
  LayoutTable01Icon,
  Settings01Icon,
  Add01Icon,
  PlusSignIcon,
  Cancel01Icon,
  Tick02Icon,
  CheckmarkCircle02Icon,
  PencilEdit02Icon,
  Delete02Icon,
  Copy01Icon,
  Search01Icon,
  FilterIcon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  Download01Icon,
  Upload01Icon,
  SentIcon,
  ReloadIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Link01Icon,
  Share08Icon,
  Alert02Icon,
  InformationCircleIcon,
  HelpCircleIcon,
  Notification02Icon,
  Clock01Icon,
  Calendar03Icon,
  File01Icon,
  FileEditIcon,
  Folder01Icon,
  Image01Icon,
  Attachment02Icon,
  Mail01Icon,
  UserIcon,
  UserGroupIcon,
  UserCircleIcon,
  Message01Icon,
  InvoiceIcon,
  DollarCircleIcon,
  CreditCardIcon,
  ColorsIcon,
  TextFontIcon,
  PaintBoardIcon,
  SlidersHorizontalIcon,
  Layers01Icon,
  ViewIcon,
  ViewOffIcon,
  StarIcon,
  Bookmark01Icon,
  Tag01Icon,
  Rocket01Icon,
  Flag01Icon,
  CheckListIcon,
  Logout01Icon,
  SquareLock01Icon,
  Key01Icon,
  SquareArrowExpand01Icon,
} from "@hugeicons/core-free-icons"

import { Input } from "@/components/ui/input"
import type { HugeiconRef } from "@/components/playground/registry"

const ICONS: { name: string; icon: HugeiconRef }[] = [
  { name: "DashboardSquare01Icon", icon: DashboardSquare01Icon },
  { name: "Home03Icon", icon: Home03Icon },
  { name: "Menu01Icon", icon: Menu01Icon },
  { name: "SidebarLeft01Icon", icon: SidebarLeft01Icon },
  { name: "GridViewIcon", icon: GridViewIcon },
  { name: "LayoutTable01Icon", icon: LayoutTable01Icon },
  { name: "Settings01Icon", icon: Settings01Icon },
  { name: "Add01Icon", icon: Add01Icon },
  { name: "PlusSignIcon", icon: PlusSignIcon },
  { name: "Cancel01Icon", icon: Cancel01Icon },
  { name: "Tick02Icon", icon: Tick02Icon },
  { name: "CheckmarkCircle02Icon", icon: CheckmarkCircle02Icon },
  { name: "PencilEdit02Icon", icon: PencilEdit02Icon },
  { name: "Delete02Icon", icon: Delete02Icon },
  { name: "Copy01Icon", icon: Copy01Icon },
  { name: "Search01Icon", icon: Search01Icon },
  { name: "FilterIcon", icon: FilterIcon },
  { name: "MoreHorizontalIcon", icon: MoreHorizontalIcon },
  { name: "MoreVerticalIcon", icon: MoreVerticalIcon },
  { name: "Download01Icon", icon: Download01Icon },
  { name: "Upload01Icon", icon: Upload01Icon },
  { name: "SentIcon", icon: SentIcon },
  { name: "ReloadIcon", icon: ReloadIcon },
  { name: "ArrowRight01Icon", icon: ArrowRight01Icon },
  { name: "ArrowLeft01Icon", icon: ArrowLeft01Icon },
  { name: "ArrowUp01Icon", icon: ArrowUp01Icon },
  { name: "ArrowDown01Icon", icon: ArrowDown01Icon },
  { name: "Link01Icon", icon: Link01Icon },
  { name: "Share08Icon", icon: Share08Icon },
  { name: "Alert02Icon", icon: Alert02Icon },
  { name: "InformationCircleIcon", icon: InformationCircleIcon },
  { name: "HelpCircleIcon", icon: HelpCircleIcon },
  { name: "Notification02Icon", icon: Notification02Icon },
  { name: "Clock01Icon", icon: Clock01Icon },
  { name: "Calendar03Icon", icon: Calendar03Icon },
  { name: "File01Icon", icon: File01Icon },
  { name: "FileEditIcon", icon: FileEditIcon },
  { name: "Folder01Icon", icon: Folder01Icon },
  { name: "Image01Icon", icon: Image01Icon },
  { name: "Attachment02Icon", icon: Attachment02Icon },
  { name: "Mail01Icon", icon: Mail01Icon },
  { name: "UserIcon", icon: UserIcon },
  { name: "UserGroupIcon", icon: UserGroupIcon },
  { name: "UserCircleIcon", icon: UserCircleIcon },
  { name: "Message01Icon", icon: Message01Icon },
  { name: "InvoiceIcon", icon: InvoiceIcon },
  { name: "DollarCircleIcon", icon: DollarCircleIcon },
  { name: "CreditCardIcon", icon: CreditCardIcon },
  { name: "ColorsIcon", icon: ColorsIcon },
  { name: "TextFontIcon", icon: TextFontIcon },
  { name: "PaintBoardIcon", icon: PaintBoardIcon },
  { name: "SlidersHorizontalIcon", icon: SlidersHorizontalIcon },
  { name: "Layers01Icon", icon: Layers01Icon },
  { name: "ViewIcon", icon: ViewIcon },
  { name: "ViewOffIcon", icon: ViewOffIcon },
  { name: "StarIcon", icon: StarIcon },
  { name: "Bookmark01Icon", icon: Bookmark01Icon },
  { name: "Tag01Icon", icon: Tag01Icon },
  { name: "Rocket01Icon", icon: Rocket01Icon },
  { name: "Flag01Icon", icon: Flag01Icon },
  { name: "CheckListIcon", icon: CheckListIcon },
  { name: "Logout01Icon", icon: Logout01Icon },
  { name: "SquareLock01Icon", icon: SquareLock01Icon },
  { name: "Key01Icon", icon: Key01Icon },
  { name: "SquareArrowExpand01Icon", icon: SquareArrowExpand01Icon },
]

export function IconsSection() {
  const [query, setQuery] = React.useState("")
  const [copied, setCopied] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ICONS
    return ICONS.filter((i) => i.name.toLowerCase().includes(q))
  }, [query])

  const copy = (name: string) => {
    navigator.clipboard?.writeText(name)
    setCopied(name)
    window.setTimeout(() => setCopied((c) => (c === name ? null : c)), 1200)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons…"
          className="max-w-xs"
        />
        <span className="font-mono text-[11px] text-muted-foreground">
          {filtered.length} / {ICONS.length} · curated
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No icons match “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {filtered.map(({ name, icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => copy(name)}
              title={name}
              className="group/icon flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon
                icon={copied === name ? Tick02Icon : icon}
                className={copied === name ? "text-chart-3" : undefined}
              />
              <span className="max-w-full truncate px-1 text-[9px] text-muted-foreground/70">
                {copied === name ? "copied" : name.replace(/Icon$/, "")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
