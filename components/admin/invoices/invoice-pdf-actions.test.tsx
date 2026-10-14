import { beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { InvoicePdfActions } from "./invoice-pdf-actions"
import { InvoicesService } from "@/lib/services/invoices-service"

const access = vi.hoisted(() => ({ allowed: true }))
vi.mock("@/hooks/use-admin-access", () => ({
  useAdminAccess: () => access.allowed,
}))

beforeEach(() => {
  cleanup()
  access.allowed = true
  URL.createObjectURL = vi.fn(() => "blob:invoice-preview")
  URL.revokeObjectURL = vi.fn()
})

describe("invoice PDF actions", () => {
  it("previews the server PDF and releases it when closed", async () => {
    const pdf = vi
      .spyOn(InvoicesService, "pdf")
      .mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }))
    const send = vi.spyOn(InvoicesService, "send")
    const user = userEvent.setup()
    render(<InvoicePdfActions id="inv1" invoiceNumber="INV-0001" />)
    await user.click(screen.getByRole("button", { name: "Preview" }))
    expect(
      await screen.findByTitle("Invoice INV-0001 PDF preview")
    ).toHaveAttribute("src", "blob:invoice-preview")
    expect(pdf).toHaveBeenCalledWith("inv1", "preview", expect.any(AbortSignal))
    expect(send).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Close" }))
    await waitFor(() =>
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:invoice-preview")
    )
  })

  it("recovers from a preview error through retry", async () => {
    vi.spyOn(InvoicesService, "pdf")
      .mockRejectedValueOnce(new Error("Failed"))
      .mockResolvedValueOnce(new Blob(["pdf"], { type: "application/pdf" }))
    const user = userEvent.setup()
    render(<InvoicePdfActions id="inv1" invoiceNumber="INV-0001" />)
    await user.click(screen.getByRole("button", { name: "Preview" }))
    await user.click(await screen.findByRole("button", { name: "Retry" }))
    expect(
      await screen.findByTitle("Invoice INV-0001 PDF preview")
    ).toBeInTheDocument()
  })

  it("downloads from the API with an invoice filename", async () => {
    const pdf = vi
      .spyOn(InvoicesService, "pdf")
      .mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" }))
    const clicks: { href: string; filename: string }[] = []
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      clicks.push({ href: this.href, filename: this.download })
    })
    const user = userEvent.setup()
    render(<InvoicePdfActions id="inv1" invoiceNumber="INV-0001" />)
    await user.click(screen.getByRole("button", { name: "Download" }))
    await waitFor(() =>
      expect(clicks).toEqual([
        { href: "blob:invoice-preview", filename: "Invoice-INV-0001.pdf" },
      ])
    )
    expect(pdf).toHaveBeenCalledWith("inv1", "download")
  })

  it("does not expose PDF actions to regular admins", () => {
    access.allowed = false
    const pdf = vi.spyOn(InvoicesService, "pdf")
    render(<InvoicePdfActions id="inv1" invoiceNumber="INV-0001" />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(pdf).not.toHaveBeenCalled()
  })
})
