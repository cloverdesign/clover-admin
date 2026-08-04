"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURRENCIES } from "@/lib/mock/currencies"
import {
  getClient,
  CLIENT_STATUS_LABEL,
  type ClientStatus,
} from "@/lib/mock/clients"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

const STATUSES: ClientStatus[] = ["LEAD", "ONBOARDING", "ACTIVE", "ON_HOLD", "CHURNED"]

/**
 * Edit Client — same editorial split as New Client, pre-filled from the record.
 * No backend: Save confirms with a toast and returns to the client.
 */
export function EditClientPage({ id }: { id?: string }) {
  const router = useRouter()
  const client = id ? getClient(id) : undefined

  const [company, setCompany] = React.useState(client?.company ?? "")
  const [contactName, setContactName] = React.useState(client?.contactName ?? "")
  const [email, setEmail] = React.useState(client?.email ?? "")
  const [phone, setPhone] = React.useState(client?.phone ?? "")
  const [location, setLocation] = React.useState(client?.location ?? "")
  const [currency, setCurrency] = React.useState(client?.currency ?? "USD")
  const [status, setStatus] = React.useState<ClientStatus>(client?.status ?? "ACTIVE")

  if (!client) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Client not found.</p>
        <Button variant="outline" render={<Link href="/admin/clients" />}>
          Go to clients
        </Button>
      </div>
    )
  }

  const backHref = `/admin/clients?c=${client.id}`
  const valid = Boolean(company.trim() && contactName.trim() && /.+@.+\..+/.test(email))

  const save = () => {
    toast.success(`Saved changes to ${company}`)
    router.push(backHref)
  }

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit client</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update the client's details. Changing the contact email changes
              their portal sign-in.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-3">
              <Monogram company={client.company} className="size-10" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{client.company}</div>
                <div className="truncate text-xs text-muted-foreground">
                  Client since {client.since}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      right={
        <div className="flex min-h-0 flex-col overflow-y-auto p-8">
          <h2 className="text-lg font-semibold tracking-tight">Client details</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Company, contact, billing currency and status.
          </p>

          <div className="space-y-4">
            <Field label="Company" htmlFor="company">
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </Field>
            <Field label="Contact name" htmlFor="contact">
              <Input id="contact" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </Field>
            <Field label="Contact email" htmlFor="email" hint="Used as the client's portal sign-in.">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" htmlFor="phone">
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
              </Field>
              <Field label="Location" htmlFor="location">
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Billing currency" htmlFor="currency">
                <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
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
              <Field label="Status" htmlFor="status">
                <Select value={status} onValueChange={(v) => v && setStatus(v as ClientStatus)}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue>
                      {(v) => CLIENT_STATUS_LABEL[v as ClientStatus] ?? v}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {CLIENT_STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href={backHref} />}>Cancel</Button>
            <Button onClick={save} disabled={!valid}>Save changes</Button>
          </div>
        </div>
      }
    />
  )
}
