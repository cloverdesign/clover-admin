"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download04Icon, Loading03Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { downloadInvoicePdf } from "@/lib/invoice-pdf"
import { invoicePdfFilename, type InvoicePdfData } from "@/lib/invoice-pdf-data"

/**
 * Download an invoice as a PDF, from either surface.
 *
 * Prefers `invoice.pdfUrl` — a server-rendered document is what the studio
 * actually issued, and is the artefact of record. The API leaves that field
 * null today, so the fallback builds the same document in the browser rather
 * than showing a dead control (the portal previously rendered no button at all,
 * leaving a client with no way to get their invoice and no explanation).
 */
export function InvoicePdfButton({
  data,
  variant = "outline",
  size = "sm",
  label = "PDF",
  className,
}: {
  data: InvoicePdfData
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  label?: string
  className?: string
}) {
  const [building, setBuilding] = React.useState(false)
  const { invoice } = data

  if (invoice.pdfUrl) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        render={
          <a
            href={invoice.pdfUrl}
            download={invoicePdfFilename(invoice.invoiceNumber)}
            target="_blank"
            rel="noreferrer"
          />
        }
      >
        <HugeiconsIcon icon={Download04Icon} data-icon="inline-start" className="size-4" />
        {label}
      </Button>
    )
  }

  const build = async () => {
    setBuilding(true)
    try {
      await downloadInvoicePdf(data)
    } catch {
      toast.error("Couldn’t build the PDF. Try again.")
    } finally {
      setBuilding(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={building}
      onClick={build}
    >
      <HugeiconsIcon
        icon={building ? Loading03Icon : Download04Icon}
        data-icon="inline-start"
        className={building ? "size-4 animate-spin" : "size-4"}
      />
      {building ? "Building…" : label}
    </Button>
  )
}
