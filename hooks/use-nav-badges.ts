import { useAllInvoices } from "@/lib/queries/invoices-queries"
import { useRevisions } from "@/lib/queries/revisions-queries"

/**
 * Live counts for the sidebar nav pills, keyed by NavItem `key`. Derived from
 * the same queries the rest of the app already runs (react-query dedupes), so
 * the numbers track reality instead of the old hardcoded strings:
 *
 * - `invoices`  — unpaid invoices (drafts + awaiting payment + overdue)
 * - `revisions` — revision requests still needing a decision (REQUESTED / IN_REVIEW)
 *
 * A key absent from the map (or 0) renders no pill.
 */
export function useNavBadges(): Record<string, number> {
  const { invoices } = useAllInvoices()
  const revisionsQ = useRevisions()
  const revisions = revisionsQ.data ?? []

  return {
    invoices: invoices.filter((i) => i.status !== "PAID").length,
    revisions: revisions.filter(
      (r) => r.status === "REQUESTED" || r.status === "IN_REVIEW"
    ).length,
  }
}
