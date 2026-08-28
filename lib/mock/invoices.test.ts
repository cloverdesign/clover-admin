import { beforeEach, describe, expect, it } from "vitest"

import { setRates, USD_RATES } from "@/lib/mock/currencies"
import {
  formatFull,
  invoiceTotals,
  isOpen,
  lineTotal,
  type Invoice,
} from "@/lib/mock/invoices"

/** Minimal invoice — only the fields the money helpers read. */
function invoice(over: Partial<Invoice>): Invoice {
  return {
    id: "i",
    projectId: "p",
    clientId: "c",
    number: "CLV-0001",
    amount: 0,
    currency: "USD",
    status: "DRAFT",
    ...over,
  } as Invoice
}

beforeEach(() => {
  // convert() reads a module-level live cache that useRates mutates. Reset it
  // so one test's rates can't leak into the next.
  setRates(USD_RATES)
})

describe("lineTotal", () => {
  it("derives the line's value from quantity x unit price", () => {
    // The API has no per-line `amount`; assuming one is what broke invoice
    // drafts, so this is the contract that replaced it.
    expect(lineTotal({ quantity: 2, unitPrice: 620_000 })).toBe(1_240_000)
    expect(lineTotal({ quantity: 1, unitPrice: 0 })).toBe(0)
  })
})

describe("isOpen", () => {
  it("counts only invoices still awaiting payment", () => {
    expect(isOpen(invoice({ status: "SENT" }))).toBe(true)
    expect(isOpen(invoice({ status: "OVERDUE" }))).toBe(true)
    expect(isOpen(invoice({ status: "PAID" }))).toBe(false)
    // A draft is internal to the studio — it isn't money anyone owes yet.
    expect(isOpen(invoice({ status: "DRAFT" }))).toBe(false)
  })
})

describe("invoiceTotals", () => {
  const data = [
    invoice({ id: "a", status: "PAID", amount: 100, currency: "USD" }),
    invoice({ id: "b", status: "SENT", amount: 200, currency: "USD" }),
    invoice({ id: "c", status: "OVERDUE", amount: 50, currency: "USD" }),
    invoice({ id: "d", status: "DRAFT", amount: 999, currency: "USD" }),
  ]

  it("splits paid, outstanding and overdue, and never counts drafts as money", () => {
    const t = invoiceTotals(data, "USD")
    expect(t.paid).toBe(100)
    expect(t.outstanding).toBe(250) // SENT + OVERDUE
    expect(t.overdue).toBe(50) // a subset of outstanding, not additional
    expect(t.draftCount).toBe(1)
  })

  it("converts mixed currencies into the display currency", () => {
    setRates({ USD: 1, NGN: 1000 })
    const mixed = [
      invoice({ status: "SENT", amount: 1000, currency: "NGN" }),
      invoice({ status: "SENT", amount: 5, currency: "USD" }),
    ]
    expect(invoiceTotals(mixed, "USD").outstanding).toBe(6)
  })

  it("returns zeroes for an empty ledger rather than NaN", () => {
    const t = invoiceTotals([], "USD")
    expect(t).toEqual({ outstanding: 0, overdue: 0, paid: 0, draftCount: 0 })
  })
})

describe("formatFull", () => {
  it("prefixes the currency symbol and groups thousands", () => {
    expect(formatFull(2_800_000, "NGN")).toBe("₦2,800,000")
    expect(formatFull(1200, "USD")).toBe("$1,200")
  })

  it("falls back to no symbol for a currency it doesn't know", () => {
    expect(formatFull(500, "XYZ")).toBe("500")
  })
})
