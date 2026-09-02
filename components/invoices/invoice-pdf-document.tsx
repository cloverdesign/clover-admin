import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

import { formatDate } from "@/lib/format"
import { lineTotal } from "@/lib/mock/invoices"
import { formatPdfMoney, type InvoicePdfData } from "@/lib/invoice-pdf-data"

/**
 * The invoice document itself.
 *
 * Deliberately plain: black on white, one typeface, no brand colour. An invoice
 * gets printed, forwarded and filed, and the studio's greens don't survive a
 * monochrome printer. Only ever loaded through `downloadInvoicePdf`, so
 * `@react-pdf/renderer` stays out of the initial bundle.
 *
 * Amounts use the ISO code rather than a symbol — see `formatPdfMoney`.
 */
const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10,
    color: "#18181b",
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  wordmark: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  issuer: { fontSize: 9, color: "#71717a", marginTop: 2 },
  docTitle: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#71717a",
    textAlign: "right",
  },
  docNumber: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    marginTop: 2,
  },
  draft: {
    marginTop: 6,
    alignSelf: "flex-end",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: "#a1a1aa",
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderStyle: "solid",
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  meta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  metaBlock: { maxWidth: "48%" },
  label: {
    fontSize: 8,
    letterSpacing: 0.8,
    color: "#71717a",
    marginBottom: 3,
  },
  strong: { fontFamily: "Helvetica-Bold" },
  dateRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 },
  dateLabel: { color: "#71717a", marginRight: 8 },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
    borderBottomStyle: "solid",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    borderBottomStyle: "solid",
    paddingVertical: 7,
  },
  cellDescription: { flex: 1, paddingRight: 12 },
  cellQty: { width: 44, textAlign: "right" },
  cellUnit: { width: 96, textAlign: "right" },
  cellAmount: { width: 104, textAlign: "right" },
  totals: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totalLabel: { fontFamily: "Helvetica-Bold", marginRight: 12 },
  totalValue: { width: 104, textAlign: "right", fontFamily: "Helvetica-Bold" },
  notes: {
    marginTop: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    borderTopStyle: "solid",
    color: "#3f3f46",
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#a1a1aa",
  },
})

export function InvoicePdfDocument({
  invoice,
  billedTo,
  projectName,
  issuer = "Clover",
}: InvoicePdfData) {
  const currency = invoice.currency
  const isDraft = invoice.status === "DRAFT"

  const dates: { label: string; value: string }[] = [
    { label: "Issued", value: formatDate(invoice.issuedDate) },
    { label: "Due", value: formatDate(invoice.dueDate) },
  ]
  if (invoice.paidDate) {
    dates.push({ label: "Paid", value: formatDate(invoice.paidDate) })
  }

  return (
    <Document
      title={`${invoice.invoiceNumber} — ${issuer}`}
      author={issuer}
      subject={projectName ? `Invoice for ${projectName}` : "Invoice"}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.wordmark}>{issuer}</Text>
            <Text style={styles.issuer}>Design studio</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>INVOICE</Text>
            <Text style={styles.docNumber}>{invoice.invoiceNumber}</Text>
            {/* A draft carries no obligation to pay. Saying so on the page
                stops a preview being mistaken for the real thing. */}
            {isDraft && <Text style={styles.draft}>DRAFT — NOT PAYABLE</Text>}
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaBlock}>
            <Text style={styles.label}>BILLED TO</Text>
            <Text style={styles.strong}>{billedTo.company}</Text>
            {billedTo.contact && <Text>{billedTo.contact}</Text>}
            {billedTo.email && <Text>{billedTo.email}</Text>}
            {projectName && (
              <Text style={{ color: "#71717a", marginTop: 4 }}>{projectName}</Text>
            )}
          </View>
          <View style={styles.metaBlock}>
            {dates.map((d) => (
              <View key={d.label} style={styles.dateRow}>
                <Text style={styles.dateLabel}>{d.label}</Text>
                <Text>{d.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tableHead}>
          <Text style={[styles.cellDescription, styles.label]}>DESCRIPTION</Text>
          <Text style={[styles.cellQty, styles.label]}>QTY</Text>
          <Text style={[styles.cellUnit, styles.label]}>UNIT PRICE</Text>
          <Text style={[styles.cellAmount, styles.label]}>AMOUNT</Text>
        </View>

        {invoice.lineItems.map((line, i) => (
          <View key={i} style={styles.row} wrap={false}>
            <Text style={styles.cellDescription}>{line.description}</Text>
            <Text style={styles.cellQty}>{line.quantity}</Text>
            <Text style={styles.cellUnit}>
              {formatPdfMoney(line.unitPrice, currency)}
            </Text>
            <Text style={styles.cellAmount}>
              {formatPdfMoney(lineTotal(line), currency)}
            </Text>
          </View>
        ))}

        <View style={styles.totals}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatPdfMoney(invoice.amount, currency)}
          </Text>
        </View>

        {invoice.description && (
          <View style={styles.notes}>
            <Text style={styles.label}>NOTES</Text>
            <Text>{invoice.description}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>
            {invoice.invoiceNumber} · Amounts in {currency}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}
