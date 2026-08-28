"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

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
import { formatDate } from "@/lib/format"
import { CLIENT_STATUS_LABEL } from "@/lib/mock/clients"
import { useClient, useUpdateClient } from "@/lib/queries/clients-queries"
import type { ClientStatus } from "@/lib/api/models"
import { Monogram } from "@/components/admin/clients/atoms"
import { Field } from "@/components/admin/clients/new-client/fields"
import { EditorialFrame } from "@/components/admin/clients/new-client/editorial-parts"

const STATUSES: ClientStatus[] = ["LEAD", "ONBOARDING", "ACTIVE", "ON_HOLD", "CHURNED"]

/** Edit Client — editorial split, pre-filled from the API and saved via
 * PUT /api/clients/{id}. */
export function EditClientPage({ id }: { id?: string }) {
  const router = useRouter()
  const clientQ = useClient(id ?? "")
  const update = useUpdateClient()

  const client = clientQ.data
  const backHref = client ? `/admin/clients?c=${client.id}` : "/admin/clients"

  if (clientQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (clientQ.isError || !client) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Client not found.</p>
        <Button variant="outline" render={<Link href="/admin/clients" />}>
          Go to clients
        </Button>
      </div>
    )
  }

  return <EditClientForm client={client} backHref={backHref} save={update} router={router} />
}

function EditClientForm({
  client,
  backHref,
  save,
  router,
}: {
  client: NonNullable<ReturnType<typeof useClient>["data"]>
  backHref: string
  save: ReturnType<typeof useUpdateClient>
  router: ReturnType<typeof useRouter>
}) {
  const [company, setCompany] = React.useState(client.company)
  const [name, setName] = React.useState(client.name)
  const [email, setEmail] = React.useState(client.email)
  const [phone, setPhone] = React.useState(client.phone ?? "")
  const [notes, setNotes] = React.useState(client.notes ?? "")
  const [status, setStatus] = React.useState<ClientStatus>(client.status)

  const valid = Boolean(company.trim() && name.trim() && /.+@.+\..+/.test(email))

  const submit = () => {
    save.mutate(
      {
        id: client.id,
        input: {
          company,
          name,
          email,
          phone: phone || undefined,
          notes: notes || undefined,
          status,
        },
      },
      { onSuccess: () => router.push(backHref) }
    )
  }

  return (
    <EditorialFrame
      left={
        <div className="relative hidden flex-col p-8 md:flex md:border-r md:border-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit client</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update the client’s details. Changing the contact email changes
              their portal sign-in.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-3">
              <Monogram company={client.company} className="size-10" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{client.company}</div>
                <div className="truncate text-xs text-muted-foreground">
                  Client since {formatDate(client.createdAt, "month")}
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
            Company, contact and status.
          </p>

          <div className="space-y-4">
            <Field label="Company" htmlFor="company">
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </Field>
            <Field label="Contact name" htmlFor="contact">
              <Input id="contact" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Contact email" htmlFor="email" hint="Used as the client's portal sign-in.">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
            </Field>
          </div>

          <div className="mt-auto flex justify-end gap-2 pt-8">
            <Button variant="outline" render={<Link href={backHref} />}>Cancel</Button>
            <Button onClick={submit} disabled={!valid || save.isPending}>
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      }
    />
  )
}
