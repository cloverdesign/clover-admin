import { NextResponse, type NextRequest } from "next/server"

/**
 * Host-based routing.
 *
 * The client portal is served exclusively from the `clients.*` subdomain
 * (production: `clients.cloverdesign.xyz`; local: `clients.localhost:3000`,
 * which modern browsers auto-resolve to loopback per RFC 6761). On that
 * host, we serve routes from `app/portal/*` with the `/portal` prefix
 * hidden from users:
 *
 *   clients.cloverdesign.xyz/projects/123
 *     └── rewrites internally to /portal/projects/123 → app/portal/(app)/projects/[id]
 *
 * `/admin/*` is redirected to `/` on this host so admin isn't reachable
 * through the client-facing domain. `/portal/*` (bookmarks) is redirected
 * to the canonical clean path.
 *
 * On any other host, this file no-ops — admin at /admin/*, portal at
 * /portal/* under the primary domain still works as before.
 */
const CLIENTS_HOST_PREFIX = "clients."

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase()
  if (!host.startsWith(CLIENTS_HOST_PREFIX)) {
    return NextResponse.next()
  }

  const { pathname } = req.nextUrl

  // Static files are served as-is on every host. Anything with a file
  // extension lives in public/ (or is a Next internal) and has no
  // counterpart under app/portal/*, so rewriting it 404s — that broke
  // /auth-wash.png and /logo.svg on the clients host. Extension-less
  // paths are routes and fall through to the rewrite below.
  if (pathname.startsWith("/_next/") || /\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next()
  }

  // Admin isn't reachable through the client-facing host.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Canonicalize bookmarked /portal/* URLs down to the clean path.
  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    const clean = pathname === "/portal" ? "/" : pathname.slice("/portal".length)
    return NextResponse.redirect(new URL(clean, req.url))
  }

  // Everything else on clients.* is served from app/portal/*.
  const url = req.nextUrl.clone()
  url.pathname = pathname === "/" ? "/portal" : `/portal${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Skip Next internals and internal API routes outright. Everything else
  // reaches proxy(), which additionally lets any file-extension path through
  // untouched (see the static-file guard above).
  matcher: ["/((?!_next/|api/).*)"],
}
