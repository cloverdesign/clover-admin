"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download04Icon,
  ViewIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { InvoicesService } from "@/lib/services/invoices-service"
import { useAdminAccess } from "@/hooks/use-admin-access"

export function InvoicePdfActions({
  id,
  invoiceNumber,
}: {
  id: string
  invoiceNumber: string
}) {
  const allowed = useAdminAccess()
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [downloading, setDownloading] = React.useState(false)
  const pending = React.useRef(false)

  async function download() {
    if (!allowed || pending.current) return
    pending.current = true
    setDownloading(true)
    try {
      const blob = await InvoicesService.pdf(id, "download")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Invoice-${invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Allow the browser to consume the blob before releasing it.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      toast.error("Couldn’t download the invoice PDF. Please try again.")
    } finally {
      pending.current = false
      setDownloading(false)
    }
  }

  if (!allowed) return null
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
        <HugeiconsIcon icon={ViewIcon} className="size-4" />
        Preview
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={downloading}
        onClick={download}
      >
        <HugeiconsIcon
          icon={downloading ? Loading03Icon : Download04Icon}
          className={downloading ? "size-4 animate-spin" : "size-4"}
        />
        {downloading ? "Downloading…" : "Download"}
      </Button>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{invoiceNumber}</DialogTitle>
            <DialogDescription>
              PDF preview. Previewing a draft does not send the invoice.
            </DialogDescription>
          </DialogHeader>
          {previewOpen && (
            <PdfPreview key={id} id={id} invoiceNumber={invoiceNumber} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function PdfPreview({
  id,
  invoiceNumber,
}: {
  id: string
  invoiceNumber: string
}) {
  const [url, setUrl] = React.useState<string>()
  const [failed, setFailed] = React.useState(false)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    const controller = new AbortController()
    let objectUrl: string | undefined
    InvoicesService.pdf(id, "preview", controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id, attempt])

  if (failed)
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Couldn’t load the invoice PDF.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFailed(false)
            setAttempt((n) => n + 1)
          }}
        >
          Retry
        </Button>
      </div>
    )
  if (!url)
    return (
      <div
        role="status"
        className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
        Loading PDF…
      </div>
    )
  return (
    <div className="min-h-0">
      <iframe
        title={`Invoice ${invoiceNumber} PDF preview`}
        src={url}
        className="h-[65dvh] w-full rounded-lg border bg-white"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Preview not displaying?{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Open PDF in a new tab
        </a>
        .
      </p>
    </div>
  )
}
