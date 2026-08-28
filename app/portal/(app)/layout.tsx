import { PortalGuard } from "@/components/portal/portal-guard"
import { PortalShell } from "@/components/portal/shell/portal-shell"

/** Guards every portal app route behind a valid client session and wraps it in
 * the client-facing shell. Public routes (login) live outside this group. */
export default function PortalAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PortalGuard>
      <PortalShell>{children}</PortalShell>
    </PortalGuard>
  )
}
