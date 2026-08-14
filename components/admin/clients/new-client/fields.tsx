"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURRENCIES } from "@/lib/mock/currencies"
import { PHASE_ORDER } from "@/lib/phase-colors"

/** Shared form model + inputs for the New Client page layouts. Each variant
 * arranges these differently; the state, validation and submit are identical. */

export type ClientFields = {
  company: string
  name: string
  email: string
  phone: string
  location: string
  currency: string
}

export type ProjectFields = {
  name: string
  phase: string
  value: string
}

const EMPTY_CLIENT: ClientFields = {
  company: "",
  name: "",
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

export type NewClientDraft = ReturnType<typeof useNewClientDraft>

/** All create-flow state + actions in one hook, so every layout shares behavior. */
export function useNewClientDraft() {
  const router = useRouter()
  const [step, setStep] = React.useState<1 | 2>(1)
  const [client, setClient] = React.useState<ClientFields>(EMPTY_CLIENT)
  const [project, setProject] = React.useState<ProjectFields>(EMPTY_PROJECT)

  const setC = <K extends keyof ClientFields>(k: K, v: ClientFields[K]) =>
    setClient((s) => ({ ...s, [k]: v }))
  const setP = <K extends keyof ProjectFields>(k: K, v: ProjectFields[K]) =>
    setProject((s) => ({ ...s, [k]: v }))

  const clientValid = Boolean(
    client.company.trim() &&
      client.name.trim() &&
      /.+@.+\..+/.test(client.email)
  )

  const cancel = () => router.push("/admin/clients")

  const submit = () => {
    if (project.name.trim()) {
      toast.success(`Created ${client.company} with project “${project.name}”`)
    } else {
      toast.success(`Created ${client.company}`)
    }
    router.push("/admin/clients")
  }

  return { step, setStep, client, setC, project, setP, clientValid, cancel, submit }
}

export function Field({
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

/** Step 1 — client details inputs. */
export function ClientDetailsFields({ draft }: { draft: NewClientDraft }) {
  const { client, setC } = draft
  return (
    <div className="space-y-4">
      <Field label="Company" htmlFor="company">
        <Input id="company" value={client.company} onChange={(e) => setC("company", e.target.value)} placeholder="Atlas Foods" />
      </Field>
      <Field label="Contact name" htmlFor="contact">
        <Input id="contact" value={client.name} onChange={(e) => setC("name", e.target.value)} placeholder="Dana Okafor" />
      </Field>
      <Field label="Contact email" htmlFor="email" hint="Used as the client's portal sign-in.">
        <Input id="email" type="email" value={client.email} onChange={(e) => setC("email", e.target.value)} placeholder="dana@atlasfoods.com" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" value={client.phone} onChange={(e) => setC("phone", e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Location" htmlFor="location">
          <Input id="location" value={client.location} onChange={(e) => setC("location", e.target.value)} placeholder="Optional" />
        </Field>
      </div>
      <Field label="Billing currency" htmlFor="currency">
        <Select value={client.currency} onValueChange={(v) => v && setC("currency", v)}>
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
    </div>
  )
}

/** Step 2 — first project inputs. */
export function ProjectDetailsFields({ draft }: { draft: NewClientDraft }) {
  const { client, project, setP } = draft
  return (
    <div className="space-y-4">
      <Field label="Project name" htmlFor="pname">
        <Input id="pname" value={project.name} onChange={(e) => setP("name", e.target.value)} placeholder="Site build" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phase" htmlFor="pphase">
          <Select value={project.phase} onValueChange={(v) => v && setP("phase", v)}>
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
          <Input id="pvalue" type="number" inputMode="numeric" value={project.value} onChange={(e) => setP("value", e.target.value)} placeholder="0" />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">
        Optional — you can add projects later from the client.
      </p>
    </div>
  )
}

export const STEPS = [
  { n: 1 as const, label: "Details" },
  { n: 2 as const, label: "First project" },
]
