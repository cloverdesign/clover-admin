/** Shared across the server page and the client variant switcher — kept in a
 * plain module so the Server Component gets the real array, not a client proxy. */
/** Layout directions for the project detail page (PROTOTYPE switcher). */
export const DETAIL_LAYOUTS = ["tabs", "split", "stacked", "focus"] as const
export type DetailLayout = (typeof DETAIL_LAYOUTS)[number]
