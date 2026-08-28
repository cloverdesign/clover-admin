"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Delete02Icon,
  UserGroupIcon,
  UnfoldMoreIcon,
  Tick02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { toApiDateTime } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { CURRENCIES, getCurrency } from "@/lib/mock/currencies"
import { PROJECT_TYPES } from "@/lib/mock/projects"
import { PHASE_ORDER } from "@/lib/phase-colors"
import { useSiteCurrency } from "@/hooks/use-site-currency"
import { useClients, useCreateClient } from "@/lib/queries/clients-queries"
import {
  useCreateProject,
  useCreateMilestone,
} from "@/lib/queries/projects-queries"
import type { Client } from "@/lib/api/models"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

type Step = "client" | "project" | "milestones"
const ORDER: Step[] = ["client", "project", "milestones"]
const STEP_META: Record<Step, { n: number; label: string; blurb: string }> = {
  client: { n: 1, label: "Client", blurb: "Pick or create the client" },
  project: { n: 2, label: "Project", blurb: "Name, phase & budget" },
  milestones: { n: 3, label: "Milestones", blurb: "Optional first milestones" },
}

const EMAIL_RE = /.+@.+\..+/

/**
 * New Project — a 3-step flow that can start anywhere: with no client (pick or
 * create one in step 1) or pre-scoped to a client (jump straight to step 2).
 * On finish it orchestrates client (if new) → project → milestones, then opens
 * the new project.
 */
export function NewProjectWizard({
  initialClientId,
  initialStep,
}: {
  initialClientId?: string
  initialStep?: Step
}) {
  const router = useRouter()
  const clientsQ = useClients()
  const clients = clientsQ.data ?? []

  const createClient = useCreateClient()
  const createProject = useCreateProject()
  const createMilestone = useCreateMilestone()

  const [step, setStep] = React.useState<Step>(
    initialStep ?? (initialClientId ? "project" : "client")
  )
  const [clientMode, setClientMode] = React.useState<"existing" | "new">(
    "existing"
  )
  const [clientId, setClientId] = React.useState(initialClientId ?? "")
  const [nc, setNc] = React.useState({
    company: "",
    name: "",
    email: "",
    phone: "",
  })
  const [siteCurrency] = useSiteCurrency()
  const currencyTouched = React.useRef(false)
  const [project, setProject] = React.useState({
    name: "",
    type: "",
    phase: "Kickoff",
    currency: siteCurrency,
    value: "",
    start: "",
    end: "",
    brief: "",
  })
  // Default the project currency to the studio's display currency (until the
  // user picks one) — it hydrates from localStorage after mount.
  React.useEffect(() => {
    if (!currencyTouched.current) {
      setProject((s) =>
        s.currency === siteCurrency ? s : { ...s, currency: siteCurrency }
      )
    }
  }, [siteCurrency])
  const [milestones, setMilestones] = React.useState<
    { title: string; due: string }[]
  >([])
  const [submitting, setSubmitting] = React.useState(false)

  const setP = <K extends keyof typeof project>(k: K, v: (typeof project)[K]) => {
    if (k === "currency") currencyTouched.current = true
    setProject((s) => ({ ...s, [k]: v }))
  }
  const setC = <K extends keyof typeof nc>(k: K, v: (typeof nc)[K]) =>
    setNc((s) => ({ ...s, [k]: v }))

  const selectedClient = clients.find((c) => c.id === clientId)
  const clientLabel =
    clientMode === "new" ? nc.company.trim() : selectedClient?.company ?? ""

  const clientValid =
    clientMode === "existing"
      ? Boolean(clientId)
      : Boolean(nc.company.trim() && nc.name.trim() && EMAIL_RE.test(nc.email))
  const projectValid = project.name.trim().length > 0

  const canReach = (s: Step): boolean => {
    if (s === "client") return true
    if (s === "project") return clientValid
    return clientValid && projectValid
  }

  const cancelHref = initialClientId
    ? `/admin/clients?c=${initialClientId}`
    : "/admin/projects"

  async function handleCreate() {
    setSubmitting(true)
    try {
      let resolvedClientId = clientId
      if (clientMode === "new") {
        const created = await createClient.mutateAsync({
          company: nc.company.trim(),
          name: nc.name.trim(),
          email: nc.email.trim(),
          phone: nc.phone.trim() || undefined,
          status: "LEAD",
        })
        resolvedClientId = created.id
      }

      const created = await createProject.mutateAsync({
        clientId: resolvedClientId,
        name: project.name.trim(),
        type: project.type || undefined,
        phase: project.phase,
        status: "PLANNING",
        currency: project.currency,
        totalValue: Number(project.value) || 0,
        startDate: toApiDateTime(project.start),
        endDate: toApiDateTime(project.end),
        description: project.brief || undefined,
      })

      const rows = milestones.filter((m) => m.title.trim())
      for (let i = 0; i < rows.length; i++) {
        await createMilestone.mutateAsync({
          projectId: created.id,
          input: {
            title: rows[i].title.trim(),
            dueDate: toApiDateTime(rows[i].due),
            status: "PENDING",
            order: i,
          },
        })
      }

      router.push(`/admin/projects/${created.id}`)
    } catch {
      // Mutation meta already surfaces an error toast; stay on the step.
      setSubmitting(false)
    }
  }

  return (
    <EditorialFrame
      left={
        <aside className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick or create a client, set up the project, and seed its first
              milestones. It appears in the client&apos;s portal and starts their
              timeline.
            </p>

            <WizardStepper current={step} canReach={canReach} onJump={setStep} />
          </div>

          <div className="mt-auto flex items-center gap-3 rounded-xl border border-border p-3">
            {clientLabel ? (
              <>
                <Monogram company={clientLabel} className="size-10" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{clientLabel}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {clientMode === "new"
                      ? "New client"
                      : selectedClient?.name ?? ""}
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <HugeiconsIcon icon={UserGroupIcon} className="size-5" />
                </span>
                <div className="text-xs text-muted-foreground">
                  No client selected yet
                </div>
              </>
            )}
          </div>
        </aside>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          {/* Mobile stepper — the vertical one lives in the left panel (md+). */}
          <div className="mb-6 md:hidden">
            <MobileStepper current={step} />
          </div>

          {step === "client" && (
            <ClientStep
              mode={clientMode}
              setMode={setClientMode}
              clients={clients}
              loading={clientsQ.isLoading}
              clientId={clientId}
              onSelect={setClientId}
              nc={nc}
              setC={setC}
            />
          )}
          {step === "project" && <ProjectStep project={project} setP={setP} />}
          {step === "milestones" && (
            <MilestonesStep
              milestones={milestones}
              setMilestones={setMilestones}
            />
          )}

          <div className="mt-auto flex justify-end gap-2 pt-8">
            {step === "client" ? (
              <Button variant="outline" render={<Link href={cancelHref} />}>
                Cancel
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setStep(ORDER[STEP_META[step].n - 2])}
              >
                Back
              </Button>
            )}

            {step === "milestones" ? (
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? "Creating…" : "Create project"}
              </Button>
            ) : (
              <Button
                onClick={() => setStep(ORDER[STEP_META[step].n])}
                disabled={step === "client" ? !clientValid : !projectValid}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      }
    />
  )
}

/* ------------------------------------------------------------------ stepper */

/** Vertical wizard stepper for the left context column (md+) — numbered nodes on
 * a connecting rail, each with a label and blurb, clickable once reachable. */
function WizardStepper({
  current,
  canReach,
  onJump,
}: {
  current: Step
  canReach: (s: Step) => boolean
  onJump: (s: Step) => void
}) {
  const currentN = STEP_META[current].n
  return (
    <ol className="mt-8 flex flex-col">
      {ORDER.map((s, i) => {
        const { n, label, blurb } = STEP_META[s]
        const done = n < currentN
        const active = s === current
        const reachable = canReach(s)
        return (
          <li key={s} className="flex gap-3">
            {/* Rail + node */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-secondary text-secondary-foreground ring-1 ring-border"
                      : "bg-card text-muted-foreground ring-1 ring-border"
                )}
              >
                {done ? (
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                ) : (
                  n
                )}
              </span>
              {i < ORDER.length - 1 && (
                <span
                  className={cn(
                    "my-1 w-px flex-1",
                    done ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            {/* Label */}
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onJump(s)}
              className={cn(
                "pb-6 text-left",
                reachable ? "cursor-pointer" : "cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "text-sm",
                  active ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </div>
              <div className="text-xs text-muted-foreground/70">{blurb}</div>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

/** Compact horizontal stepper shown on mobile, where the left panel is hidden. */
function MobileStepper({ current }: { current: Step }) {
  const currentN = STEP_META[current].n
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {ORDER.map((s, i) => {
        const { n, label } = STEP_META[s]
        const active = s === current
        const done = n < currentN
        return (
          <React.Fragment key={s}>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex size-4.5 items-center justify-center rounded-full text-[10px] font-medium",
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {n}
              </span>
              <span className={active ? "text-foreground" : "text-muted-foreground"}>
                {label}
              </span>
            </div>
            {i < ORDER.length - 1 && <span className="h-px w-4 bg-border" />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------- step: client */

function ClientStep({
  mode,
  setMode,
  clients,
  loading,
  clientId,
  onSelect,
  nc,
  setC,
}: {
  mode: "existing" | "new"
  setMode: (m: "existing" | "new") => void
  clients: Client[]
  loading: boolean
  clientId: string
  onSelect: (id: string) => void
  nc: { company: string; name: string; email: string; phone: string }
  setC: (k: "company" | "name" | "email" | "phone", v: string) => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">Client</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Choose who this project is for, or add a new client without leaving the
        page.
      </p>

      {mode === "existing" ? (
        <div className="space-y-4">
          <Field label="Client" htmlFor="client-picker">
            <ClientCombobox
              clients={clients}
              loading={loading}
              value={clientId}
              onSelect={onSelect}
              onCreateNew={() => setMode("new")}
            />
          </Field>
          <button
            type="button"
            onClick={() => setMode("new")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Create a new client instead
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-dashed border-border px-3 py-2 text-sm">
            <span className="text-muted-foreground">Creating a new client</span>
            <button
              type="button"
              onClick={() => setMode("existing")}
              className="text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Pick existing
            </button>
          </div>
          <Field label="Company" htmlFor="nc-company">
            <Input
              id="nc-company"
              value={nc.company}
              onChange={(e) => setC("company", e.target.value)}
              placeholder="Contoso Foods"
            />
          </Field>
          <Field label="Contact name" htmlFor="nc-name">
            <Input
              id="nc-name"
              value={nc.name}
              onChange={(e) => setC("name", e.target.value)}
              placeholder="Dana Okafor"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Contact email"
              htmlFor="nc-email"
              hint="Their portal sign-in."
            >
              <Input
                id="nc-email"
                type="email"
                value={nc.email}
                onChange={(e) => setC("email", e.target.value)}
                placeholder="dana@example.com"
              />
            </Field>
            <Field label="Phone" htmlFor="nc-phone">
              <Input
                id="nc-phone"
                value={nc.phone}
                onChange={(e) => setC("phone", e.target.value)}
                placeholder="Optional"
              />
            </Field>
          </div>
          <p className="text-xs text-muted-foreground">
            The client is created when you finish. Add fuller details later from
            their page.
          </p>
        </div>
      )}
    </div>
  )
}

function ClientCombobox({
  clients,
  loading,
  value,
  onSelect,
  onCreateNew,
}: {
  clients: Client[]
  loading: boolean
  value: string
  onSelect: (id: string) => void
  onCreateNew: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const selected = clients.find((c) => c.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id="client-picker"
        className="flex h-9 w-full items-center gap-2 rounded-(--input-radius) border border-input bg-background px-3 text-left text-sm transition-colors hover:border-ring/60 aria-expanded:border-ring/60"
      >
        {selected ? (
          <>
            <Monogram company={selected.company} className="size-5 text-[9px]" />
            <span className="truncate">{selected.company}</span>
          </>
        ) : (
          <span className="text-muted-foreground">
            {loading ? "Loading clients…" : "Select a client…"}
          </span>
        )}
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          className="ml-auto size-4 shrink-0 text-muted-foreground"
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) p-0">
        <Command>
          <CommandInput placeholder="Search clients…" />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              {clients.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.company} ${c.name}`}
                  onSelect={() => {
                    onSelect(c.id)
                    setOpen(false)
                  }}
                  className="gap-2"
                >
                  <Monogram company={c.company} className="size-5 text-[9px]" />
                  <span className="truncate">{c.company}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {c.name}
                  </span>
                  {c.id === value && (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      className="ml-auto size-4"
                    />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onCreateNew()
                  setOpen(false)
                }}
                className="gap-2 text-muted-foreground"
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4" />
                Create a new client
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------ step: project */

type ProjectFields = {
  name: string
  type: string
  phase: string
  currency: string
  value: string
  start: string
  end: string
  brief: string
}

function ProjectStep({
  project,
  setP,
}: {
  project: ProjectFields
  setP: (k: keyof ProjectFields, v: string) => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">Project details</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Name it, set the starting phase and budget.
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Project name" htmlFor="pname">
            <Input
              id="pname"
              value={project.name}
              onChange={(e) => setP("name", e.target.value)}
              placeholder="Site build"
            />
          </Field>
          <Field label="Type" htmlFor="ptype">
            <Select
              value={project.type}
              onValueChange={(v) => v && setP("type", v)}
            >
              <SelectTrigger id="ptype" className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Starting phase" htmlFor="pphase">
            <Select
              value={project.phase}
              onValueChange={(v) => v && setP("phase", v)}
            >
              <SelectTrigger id="pphase" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHASE_ORDER.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Currency" htmlFor="pcurrency">
            <Select
              value={project.currency}
              onValueChange={(v) => v && setP("currency", v)}
            >
              <SelectTrigger id="pcurrency" className="w-full gap-1.5">
                <SelectValue>
                  {(code) => {
                    const c = getCurrency(String(code))
                    return (
                      <span>
                        {c?.flag} {c?.code}
                      </span>
                    )
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        {/* Value — label left, the selected currency (static) on the right. */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="pvalue">Value</Label>
            <span className="text-sm text-muted-foreground">
              {getCurrency(project.currency)?.flag} {project.currency}
            </span>
          </div>
          <Input
            id="pvalue"
            type="number"
            inputMode="numeric"
            value={project.value}
            onChange={(e) => setP("value", e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Start date"
            htmlFor="pstart"
            hint="Optional — when it kicks off."
          >
            <DatePicker
              id="pstart"
              value={project.start}
              onChange={(v) => setP("start", v)}
              placeholder="No start date"
            />
          </Field>
          <Field label="Target end date" htmlFor="pend" hint="Optional.">
            <DatePicker
              id="pend"
              value={project.end}
              onChange={(v) => setP("end", v)}
              placeholder="No end date"
            />
          </Field>
        </div>
        <Field
          label="Brief"
          htmlFor="pbrief"
          hint="Optional — a short summary of the work."
        >
          <Textarea
            id="pbrief"
            value={project.brief}
            onChange={(e) => setP("brief", e.target.value)}
            rows={4}
            placeholder="What are we building?"
          />
        </Field>
      </div>
    </div>
  )
}

/* --------------------------------------------------------- step: milestones */

function MilestonesStep({
  milestones,
  setMilestones,
}: {
  milestones: { title: string; due: string }[]
  setMilestones: React.Dispatch<
    React.SetStateAction<{ title: string; due: string }[]>
  >
}) {
  const update = (i: number, patch: Partial<{ title: string; due: string }>) =>
    setMilestones((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    )
  const remove = (i: number) =>
    setMilestones((rows) => rows.filter((_, idx) => idx !== i))
  const add = () =>
    setMilestones((rows) => [...rows, { title: "", due: "" }])

  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">Milestones</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Optional — seed the first milestones. You can always add more later.
      </p>

      <div className="space-y-2">
        {milestones.map((m, i) => (
          <div key={i} className="flex items-start gap-2">
            <Input
              value={m.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder={`Milestone ${i + 1}`}
              className="flex-1"
            />
            <DatePicker
              value={m.due}
              onChange={(v) => update(i, { due: v })}
              placeholder="Due date"
              className="w-40"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove milestone"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {milestones.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            No milestones yet — add one, or skip and create the project.
          </p>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={add}
        className="mt-3 gap-1.5"
      >
        <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" className="size-4" />
        Add milestone
      </Button>
    </div>
  )
}
