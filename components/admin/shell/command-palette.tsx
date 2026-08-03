"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  Folder01Icon,
  Invoice01Icon,
  Task01Icon,
  DeliveryBox01Icon,
} from "@hugeicons/core-free-icons"

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { ALL_ITEMS } from "@/components/admin/shell/nav-data"
import {
  SEARCH_INDEX,
  type SearchEntity,
  type SearchType,
} from "@/lib/mock/search"

/** Open-state context so the shell's search field (and ⌘K) can summon the palette. */
const CommandPaletteContext = React.createContext<{
  setOpen: (open: boolean) => void
}>({ setOpen: () => {} })

export function useCommandPalette() {
  return React.useContext(CommandPaletteContext)
}

const TYPE_ICON: Record<SearchType, typeof UserGroupIcon> = {
  client: UserGroupIcon,
  project: Folder01Icon,
  invoice: Invoice01Icon,
  revision: Task01Icon,
  deliverable: DeliveryBox01Icon,
}

const GROUPS: { type: SearchType; label: string }[] = [
  { type: "client", label: "Clients" },
  { type: "project", label: "Projects" },
  { type: "invoice", label: "Invoices" },
  { type: "revision", label: "Revision requests" },
  { type: "deliverable", label: "Deliverables" },
]

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  // ⌘K / Ctrl+K toggles the palette from anywhere.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const go = React.useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  const ctx = React.useMemo(() => ({ setOpen }), [])

  return (
    <CommandPaletteContext.Provider value={ctx}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="max-w-xl"
        title="Search"
        description="Search clients, projects, invoices, and requests"
      >
        <Command
          className="rounded-none bg-transparent p-0"
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
        <CommandInput
          placeholder="Search clients, projects, invoices…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Go to">
            {ALL_ITEMS.map((item) => (
              <CommandItem
                key={item.key}
                value={`page ${item.label}`}
                onSelect={() => go(item.href)}
              >
                <HugeiconsIcon icon={item.icon} className="text-muted-foreground" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {query === "" ? (
            <CommandGroup heading="Recent clients">
              {SEARCH_INDEX.filter((e) => e.type === "client")
                .slice(0, 5)
                .map((e) => (
                  <ResultItem key={e.id} entity={e} onSelect={go} />
                ))}
            </CommandGroup>
          ) : (
            GROUPS.map((g) => {
              const items = SEARCH_INDEX.filter((e) => e.type === g.type)
              if (!items.length) return null
              return (
                <CommandGroup key={g.type} heading={g.label}>
                  {items.map((e) => (
                    <ResultItem key={e.id} entity={e} onSelect={go} />
                  ))}
                </CommandGroup>
              )
            })
          )}
        </CommandList>
        </Command>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  )
}

function ResultItem({
  entity,
  onSelect,
}: {
  entity: SearchEntity
  onSelect: (href: string) => void
}) {
  return (
    <CommandItem
      value={`${entity.title} ${entity.keywords} ${entity.id}`}
      onSelect={() => onSelect(entity.href)}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <HugeiconsIcon icon={TYPE_ICON[entity.type]} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate">{entity.title}</div>
        {entity.subtitle && (
          <div className="truncate text-xs text-muted-foreground">
            {entity.subtitle}
          </div>
        )}
      </div>
    </CommandItem>
  )
}
