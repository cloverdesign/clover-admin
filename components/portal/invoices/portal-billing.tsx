"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { formatDate } from "@/lib/format"
import { formatFull } from "@/lib/mock/invoices"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs"
import {
  usePortalAllInvoices,
  usePortalProjects,
} from "@/lib/queries/portal-queries"
import {
  PortalPage,
  PortalTab,
  PortalStats,
  PortalTableFooter,
} from "@/components/portal/shell/portal-page"
import { billingSummary } from "@/components/portal/home/use-portal-overview"
import {
  InvoiceList,
  visibleInvoices,
} from "@/components/portal/invoices/invoice-list"
import type { Invoice } from "@/lib/api/models"

const SLICES = ["all", "open", "paid"] as const
type Slice = (typeof SLICES)[number]

const SLICE_LABEL: Record<Slice, string> = {
  all: "All",
  open: "Open",
  paid: "Paid",
}

function inSlice(invoice: Invoice, slice: Slice): boolean {
  if (slice === "open") return invoice.status === "SENT" || invoice.status === "OVERDUE"
  if (slice === "paid") return invoice.status === "PAID"
  return true
}

/**
 * Everything billed, in one place — the page `GET /api/portal/invoices` made
 * possible. The figures above the tabs reuse the dashboard's `billingSummary`,
 * so the headline here and the card there can't disagree.
 */
export function PortalBilling() {
  const invoicesQ = usePortalAllInvoices()
  const projectsQ = usePortalProjects()
  const [tab, setTab] = React.useState<Slice>("all")

  const projects = projectsQ.data ?? []
  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "A project"

  if (invoicesQ.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      </div>
    )
  }
  if (invoicesQ.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your invoices.</p>
        <Button variant="outline" size="sm" onClick={() => invoicesQ.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const invoices = invoicesQ.data ?? []
  const issued = visibleInvoices(invoices)
  const billing = billingSummary(invoices)
  const forSlice = (slice: Slice) => issued.filter((i) => inSlice(i, slice))

  return (
    <Tabs value={tab} onValueChange={(v) => v && setTab(v as Slice)} className="gap-0">
      <PortalPage
        title="Invoices"
        count={issued.length}
        stats={
          billing && (
            <PortalStats
              items={[
                { label: "Paid", value: formatFull(billing.paid, billing.currency) },
                {
                  label: "Outstanding",
                  value: formatFull(billing.outstanding, billing.currency),
                },
                ...(billing.nextDue
                  ? [
                      {
                        label: billing.nextDue.overdue ? "Overdue since" : "Next due",
                        value: billing.nextDue.dueDate
                          ? formatDate(billing.nextDue.dueDate)
                          : billing.nextDue.invoiceNumber,
                        tone: billing.nextDue.overdue ? "text-destructive" : undefined,
                      },
                    ]
                  : []),
              ]}
            />
          )
        }
        tabs={
          issued.length > 0 ? (
            <TabsList variant="line">
              {SLICES.map((slice) => (
                <PortalTab
                  key={slice}
                  value={slice}
                  count={forSlice(slice).length}
                >
                  {SLICE_LABEL[slice]}
                </PortalTab>
              ))}
            </TabsList>
          ) : null
        }
      >
        {issued.length === 0 ? (
          <InvoiceList invoices={[]} />
        ) : (
          SLICES.map((slice) => (
            <TabsContent key={slice} value={slice}>
              <InvoiceList
                invoices={forSlice(slice)}
                projectName={projectName}
                emptyMessage={
                  slice === "open"
                    ? "Nothing outstanding. You’re all paid up."
                    : "No paid invoices yet."
                }
              />
              {forSlice(slice).length > 0 && (
                <PortalTableFooter>
                  {forSlice(slice).length} invoice
                  {forSlice(slice).length === 1 ? "" : "s"}
                </PortalTableFooter>
              )}
            </TabsContent>
          ))
        )}
      </PortalPage>
    </Tabs>
  )
}
