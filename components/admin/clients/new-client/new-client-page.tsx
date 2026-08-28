"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CLIENT_STATUS_LABEL } from "@/lib/mock/clients"
import { useCreateClient } from "@/lib/queries/clients-queries"
import type { ClientStatus } from "@/lib/api/models"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

const STATUSES: ClientStatus[] = ["LEAD", "ONBOARDING", "ACTIVE", "ON_HOLD", "CHURNED"]

/** New Client — editorial split, wired to POST /api/clients. Their contact
 * email becomes their portal sign-in. Add projects afterwards from the client. */
export function NewClientPage() {
  const router = useRouter()
  const create = useCreateClient()

  const [company, setCompany] = React.useState("")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [status, setStatus] = React.useState<ClientStatus>("LEAD")
  const [notes, setNotes] = React.useState("")

  const valid = Boolean(company.trim() && name.trim() && /.+@.+\..+/.test(email))

  const submit = () => {
    create.mutate(
      {
        company,
        name,
        email,
        phone: phone || undefined,
        notes: notes || undefined,
        status,
      },
      { onSuccess: () => router.push("/admin/clients") }
    )
  }

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Onboard a client</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Company and a contact. Their email becomes their portal sign-in;
              add projects afterwards.
            </p>
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Client details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Company, contact and status.
          </p>

          <div className="space-y-4">
            <Field label="Company" htmlFor="company">
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Contoso Foods" />
            </Field>
            <Field label="Contact name" htmlFor="contact">
              <Input id="contact" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dana Okafor" />
            </Field>
            <Field label="Contact email" htmlFor="email" hint="Used as the client's portal sign-in.">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dana@example.com" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" htmlFor="phone">
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
              </Field>
              <Field label="Status" htmlFor="status">
                <Select value={status} onValueChange={(v) => v && setStatus(v as ClientStatus)}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue>
                      {(v) => CLIENT_STATUS_LABEL[v as ClientStatus] ?? v}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{CLIENT_STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Notes" htmlFor="notes">
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional — anything worth remembering." />
            </Field>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href="/admin/clients" />}>Cancel</Button>
            <Button onClick={submit} disabled={!valid || create.isPending}>
              {create.isPending ? "Creating…" : "Create client"}
            </Button>
          </div>
        </div>
      }
    />
  )
}
