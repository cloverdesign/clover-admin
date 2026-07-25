"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SlidersHorizontalIcon,
  Cancel01Icon,
  SentIcon,
  ReloadIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useOverrides } from "@/components/playground/override-context"
import { useComputedTokens } from "@/components/playground/use-tokens"

// Primitive step names for the palette pickers.
const RAMPS: Record<string, string[]> = {
  Neutral: [
    "neutral-0", "neutral-50", "neutral-100", "neutral-200", "neutral-300",
    "neutral-400", "neutral-500", "neutral-600", "neutral-700", "neutral-800",
    "neutral-900", "neutral-950",
  ],
  Lime: [
    "lime-50", "lime-100", "lime-200", "lime-300", "lime-400", "lime-500",
    "lime-600", "lime-700", "lime-800", "lime-900", "lime-950",
  ],
  Red: [
    "red-50", "red-100", "red-200", "red-300", "red-400", "red-500",
    "red-600", "red-700", "red-800", "red-900", "red-950",
  ],
}

const ROLES = [
  "primary", "secondary", "accent", "muted",
  "destructive", "ring", "border", "background", "foreground",
]

type Knob = { varName: string; label: string; min: number; max: number }
const COMPONENT_KNOBS: { component: string; label: string; knobs: Knob[] }[] = [
  { component: "button", label: "Button", knobs: [{ varName: "--button-radius", label: "Radius", min: 0, max: 40 }] },
  { component: "badge", label: "Badge", knobs: [{ varName: "--badge-radius", label: "Radius", min: 0, max: 24 }] },
  { component: "card", label: "Card", knobs: [{ varName: "--card-radius", label: "Radius", min: 0, max: 40 }] },
  { component: "input", label: "Input", knobs: [{ varName: "--input-radius", label: "Radius", min: 0, max: 40 }] },
]

function radiusToPx(value: string) {
  const n = parseFloat(value)
  if (Number.isNaN(n)) return 10
  return value.includes("rem") ? n * 16 : n
}

export function TweakPanel({ onClose }: { onClose: () => void }) {
  const { tokens, components, note, setNote, resetAll, count } = useOverrides()
  const [syncing, setSyncing] = React.useState(false)
  const nothingToSync = count === 0 && !note.trim()

  async function sync() {
    setSyncing(true)
    try {
      const res = await fetch("/api/playground/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens, components, note }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success(`Synced to ${data.dir}/`, {
          description: `${data.count} override${
            data.count === 1 ? "" : "s"
          } + note staged. Tell Claude “apply my tweaks”.`,
        })
      } else {
        toast.error(data.error ?? "Sync failed")
      }
    } catch (err) {
      toast.error("Sync failed", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l">
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={SlidersHorizontalIcon}
            className="size-4 text-muted-foreground"
          />
          <span className="text-sm font-medium">Tweak</span>
          {count > 0 && (
            <span className="rounded-full bg-chart-3/15 px-1.5 py-0.5 font-mono text-[10px] text-chart-3">
              {count}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Close tweak panel"
          onClick={onClose}
        >
          <HugeiconsIcon icon={Cancel01Icon} />
        </Button>
      </div>

      <Tabs defaultValue="tokens" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="border-b p-3">
          <TabsList className="w-full">
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="component">Component</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <TabsContent value="tokens" className="flex flex-col gap-6 p-4">
            <RadiusControl />
            <div className="flex flex-col gap-1">
              <PanelLabel>Color roles</PanelLabel>
              <div className="flex flex-col">
                {ROLES.map((role) => (
                  <RoleRow key={role} role={role} active={tokens[`--${role}`]} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="component" className="flex flex-col gap-5 p-4">
            <ComponentTab />
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex flex-col gap-3 border-t p-4">
        <div className="flex flex-col gap-2">
          <PanelLabel>Note to Claude</PanelLabel>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. make badges less rounded, closer to sample 5…"
            className="min-h-20 resize-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="flex-1"
            disabled={nothingToSync || syncing}
            onClick={sync}
          >
            <HugeiconsIcon icon={SentIcon} />
            {syncing ? "Syncing…" : "Sync to Claude"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Reset overrides"
            disabled={count === 0}
            onClick={resetAll}
          >
            <HugeiconsIcon icon={ReloadIcon} />
          </Button>
        </div>
      </div>
    </aside>
  )
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  )
}

function RadiusControl() {
  const { tokens, setToken, resetToken } = useOverrides()
  const { "--radius": computed } = useComputedTokens(["--radius"])
  const px = Math.round(radiusToPx(tokens["--radius"] ?? computed ?? "0.625rem"))
  const overridden = "--radius" in tokens

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <PanelLabel>Radius</PanelLabel>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            {px}px
          </span>
          {overridden && <ResetDot onClick={() => resetToken("--radius")} />}
        </div>
      </div>
      <Slider
        value={[px]}
        min={0}
        max={24}
        step={1}
        onValueChange={(v) =>
          setToken("--radius", `${(Array.isArray(v) ? v[0] : v) / 16}rem`)
        }
      />
    </div>
  )
}

function RoleRow({ role, active }: { role: string; active?: string }) {
  const { setToken, resetToken } = useOverrides()

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm">{role}</span>
      <div className="flex items-center gap-1.5">
        {active && <ResetDot onClick={() => resetToken(`--${role}`)} />}
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                aria-label={`Edit ${role}`}
                className={cn(
                  "size-6 rounded-md border ring-offset-1 transition-shadow hover:ring-2 hover:ring-ring/50",
                  active && "ring-2 ring-chart-3/50"
                )}
                style={{ background: `var(--${role})` }}
              />
            }
          />
          <PopoverContent className="w-64">
            <div className="flex flex-col gap-3">
              {Object.entries(RAMPS).map(([label, names]) => (
                <div key={label}>
                  <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                    {label}
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {names.map((name) => (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() =>
                          setToken(`--${role}`, `var(--color-${name})`)
                        }
                        className="aspect-square rounded-md border transition-transform hover:scale-110"
                        style={{ background: `var(--color-${name})` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

function ComponentTab() {
  const allVars = React.useMemo(
    () => COMPONENT_KNOBS.flatMap((c) => c.knobs.map((k) => k.varName)),
    []
  )
  const computed = useComputedTokens(allVars)

  return (
    <>
      {COMPONENT_KNOBS.map((c) => (
        <div key={c.component} className="flex flex-col gap-2.5">
          <PanelLabel>{c.label}</PanelLabel>
          {c.knobs.map((knob) => (
            <KnobRow
              key={knob.varName}
              component={c.component}
              knob={knob}
              computed={computed[knob.varName]}
            />
          ))}
        </div>
      ))}
    </>
  )
}

function KnobRow({
  component,
  knob,
  computed,
}: {
  component: string
  knob: Knob
  computed?: string
}) {
  const { components, setComponent, resetComponent } = useOverrides()
  const override = components[component]?.[knob.varName]
  const px = Math.round(radiusToPx(override ?? computed ?? "0"))
  const overridden = override != null

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{knob.label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            {px}px
          </span>
          {overridden && (
            <ResetDot onClick={() => resetComponent(component, knob.varName)} />
          )}
        </div>
      </div>
      <Slider
        value={[px]}
        min={knob.min}
        max={knob.max}
        step={1}
        onValueChange={(v) =>
          setComponent(
            component,
            knob.varName,
            `${Array.isArray(v) ? v[0] : v}px`
          )
        }
      />
    </div>
  )
}

function ResetDot({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Reset"
      className="flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <HugeiconsIcon icon={ReloadIcon} className="size-3" />
    </button>
  )
}
