"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURRENCIES } from "@/lib/mock/currencies"
import { PHASE_ORDER } from "@/lib/phase-colors"
import type { Client } from "@/lib/mock/clients"

type Mode = { kind: "new" } | { kind: "edit"; client: Client }

const ClientFormContext = React.createContext<{
  openNew: () => void
  openEdit: (client: Client) => void
}>({ openNew: () => {}, openEdit: () => {} })

export function useClientForm() {
  return React.useContext(ClientFormContext)
}

/** Wraps the admin surface so the top-bar "New client" and per-client "Edit"
 * can summon the shared slide-over form from anywhere. */
export function ClientFormProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode | null>(null)
  const value = React.useMemo(
    () => ({
      openNew: () => setMode({ kind: "new" }),
      openEdit: (client: Client) => setMode({ kind: "edit", client }),
    }),
    []
  )
  return (
    <ClientFormContext.Provider value={value}>
      {children}
      <ClientFormSheet mode={mode} onClose={() => setMode(null)} />
    </ClientFormContext.Provider>
  )
}

/** A "New client" trigger button usable inside empty states. */
export function NewClientButton({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const { openNew } = useClientForm()
  return (
    <Button onClick={openNew} className={className}>
      {children ?? "New client"}
    </Button>
  )
}

type ClientFields = {
  company: string
  contactName: string
  email: string
  phone: string
  location: string
  currency: string
}

type ProjectFields = {
  name: string
  phase: string
  value: string
}

const EMPTY_CLIENT: ClientFields = {
  company: "",
  contactName: "",
  email: "",
  phone: "",
  location: "",
  currency: "USD",
}

const EMPTY_PROJECT: ProjectFields = {
  name: "",
  phase: "Kickoff",
  value: "",
}

function ClientFormSheet({
  mode,
  onClose,
}: {
  mode: Mode | null
  onClose: () => void
}) {
  const isEdit = mode?.kind === "edit"
  const [step, setStep] = React.useState<1 | 2>(1)
  const [client, setClient] = React.useState<ClientFields>(EMPTY_CLIENT)
  const [project, setProject] = React.useState<ProjectFields>(EMPTY_PROJECT)

  // Seed the form whenever the sheet opens (new = blank, edit = prefilled).
  React.useEffect(() => {
    if (!mode) return
    setStep(1)
    setProject(EMPTY_PROJECT)
    if (mode.kind === "edit") {
      const c = mode.client
      setClient({
        company: c.company,
        contactName: c.contactName,
        email: c.email,
        phone: c.phone ?? "",
        location: c.location ?? "",
        currency: c.currency,
      })
    } else {
      setClient(EMPTY_CLIENT)
    }
  }, [mode])

  const set = <K extends keyof ClientFields>(k: K, v: ClientFields[K]) =>
    setClient((s) => ({ ...s, [k]: v }))
  const setProj = <K extends keyof ProjectFields>(k: K, v: ProjectFields[K]) =>
    setProject((s) => ({ ...s, [k]: v }))

  const clientValid =
    client.company.trim() &&
    client.contactName.trim() &&
    /.+@.+\..+/.test(client.email)

  const save = () => {
    // No backend yet — confirm with a toast and close (dummy, like auth).
    if (isEdit) {
      toast.success(`Saved changes to ${client.company}`)
    } else if (project.name.trim()) {
      toast.success(`Created ${client.company} with project “${project.name}”`)
    } else {
      toast.success(`Created ${client.company}`)
    }
    onClose()
  }

  const title = isEdit
    ? "Edit client"
    : step === 1
      ? "New client"
      : "First project"
  const description = isEdit
    ? "Update this client's details."
    : step === 1
      ? "Their contact email becomes their portal sign-in."
      : `Add ${client.company || "the client"}'s first project — optional.`

  return (
    <Dialog open={mode != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="gap-1 border-b border-border px-5 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {!isEdit && (
            <div className="mt-2 flex items-center gap-1.5">
              <Step n={1} active={step === 1} done={step > 1} label="Details" />
              <div className="h-px w-4 bg-border" />
              <Step n={2} active={step === 2} label="Project" />
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {isEdit || step === 1 ? (
            <>
              <Field label="Company" htmlFor="company">
                <Input id="company" value={client.company} onChange={(e) => set("company", e.target.value)} placeholder="Atlas Foods" />
              </Field>
              <Field label="Contact name" htmlFor="contact">
                <Input id="contact" value={client.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Dana Okafor" />
              </Field>
              <Field label="Contact email" htmlFor="email" hint="Used as the client's portal sign-in.">
                <Input id="email" type="email" value={client.email} onChange={(e) => set("email", e.target.value)} placeholder="dana@atlasfoods.com" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone" htmlFor="phone">
                  <Input id="phone" value={client.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optional" />
                </Field>
                <Field label="Location" htmlFor="location">
                  <Input id="location" value={client.location} onChange={(e) => set("location", e.target.value)} placeholder="Optional" />
                </Field>
              </div>
              <Field label="Billing currency" htmlFor="currency">
                <Select value={client.currency} onValueChange={(v) => v && set("currency", v)}>
                  <SelectTrigger id="currency" className="w-full">
                    <SelectValue />
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
            </>
          ) : (
            <>
              <Field label="Project name" htmlFor="pname">
                <Input id="pname" value={project.name} onChange={(e) => setProj("name", e.target.value)} placeholder="Site build" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phase" htmlFor="pphase">
                  <Select value={project.phase} onValueChange={(v) => v && setProj("phase", v)}>
                    <SelectTrigger id="pphase" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PHASE_ORDER.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={`Value (${client.currency})`} htmlFor="pvalue">
                  <Input id="pvalue" type="number" inputMode="numeric" value={project.value} onChange={(e) => setProj("value", e.target.value)} placeholder="0" />
                </Field>
              </div>
              <p className="text-xs text-muted-foreground">
                You can skip this and add projects later from the client.
              </p>
            </>
          )}
        </div>

        <DialogFooter className="flex-row justify-end gap-2 border-t border-border px-5 py-4">
          {isEdit ? (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={save} disabled={!clientValid}>Save changes</Button>
            </>
          ) : step === 1 ? (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => setStep(2)} disabled={!clientValid}>Next</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={save}>Create client</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Step({
  n,
  active,
  done,
  label,
}: {
  n: number
  active?: boolean
  done?: boolean
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span
        className={
          "flex size-4.5 items-center justify-center rounded-full text-[10px] font-medium " +
          (active
            ? "bg-primary text-primary-foreground"
            : done
              ? "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground")
        }
      >
        {n}
      </span>
      <span className={active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  )
}
