import { describe, expect, it } from "vitest"

import { formatPdfMoney, invoicePdfFilename } from "@/lib/invoice-pdf-data"

describe("formatPdfMoney", () => {
  it("uses the ISO code rather than a symbol", () => {
    // The PDF's Helvetica has no ₦ glyph, and "$" is ambiguous across the
    // dollars the studio bills in.
    expect(formatPdfMoney(580000, "NGN")).toBe("NGN 580,000.00")
    expect(formatPdfMoney(1200, "USD")).toBe("USD 1,200.00")
    expect(formatPdfMoney(1200, "CAD")).toBe("CAD 1,200.00")
  })

  it("always states two decimal places", () => {
    expect(formatPdfMoney(8000, "EUR")).toBe("EUR 8,000.00")
    expect(formatPdfMoney(8000.5, "EUR")).toBe("EUR 8,000.50")
    expect(formatPdfMoney(0, "GBP")).toBe("GBP 0.00")
  })

  it("rounds to the cent rather than leaking float artefacts", () => {
    expect(formatPdfMoney(7 * 1.1, "USD")).toBe("USD 7.70")
  })

  it("falls back to the raw code when Intl rejects it", () => {
    // Intl throws on a malformed currency code rather than degrading.
    expect(formatPdfMoney(500, "NOTACODE")).toBe("NOTACODE 500.00")
  })

  it("treats a non-finite amount as zero", () => {
    expect(formatPdfMoney(Number.NaN, "USD")).toBe("USD 0.00")
    expect(formatPdfMoney(Number.POSITIVE_INFINITY, "USD")).toBe("USD 0.00")
  })

  it("emits no non-breaking spaces", () => {
    // They measure and wrap unpredictably in the PDF layout engine.
    expect(formatPdfMoney(580000, "NGN")).not.toMatch(/ /)
  })
})

describe("invoicePdfFilename", () => {
  it("keeps a well-formed invoice number intact", () => {
    expect(invoicePdfFilename("INV-0001")).toBe("INV-0001.pdf")
    expect(invoicePdfFilename("INV-2024-014")).toBe("INV-2024-014.pdf")
  })

  it("replaces characters that are awkward in a filename", () => {
    // The number is studio-authored free text, so slashes and spaces happen.
    expect(invoicePdfFilename("INV 2024/014")).toBe("INV-2024-014.pdf")
  })

  it("lets no path separator through", () => {
    // Dots are legal in a filename and survive; separators are what matter,
    // so nothing can climb out of the download directory.
    const name = invoicePdfFilename("../../etc/passwd")
    expect(name).toBe("..-..-etc-passwd.pdf")
    expect(name).not.toMatch(/[/\\]/)
  })

  it("trims separators from the ends", () => {
    expect(invoicePdfFilename("  INV-7  ")).toBe("INV-7.pdf")
    expect(invoicePdfFilename("///INV-7///")).toBe("INV-7.pdf")
  })

  it("falls back when nothing usable survives", () => {
    expect(invoicePdfFilename("")).toBe("invoice.pdf")
    expect(invoicePdfFilename("///")).toBe("invoice.pdf")
  })
})
