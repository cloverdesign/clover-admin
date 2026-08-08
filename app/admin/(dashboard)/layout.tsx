import { AdminShell } from "@/components/admin/shell/admin-shell"
import { AuthGuard } from "@/components/admin/auth/auth-guard"

// Wraps every authenticated admin route in the floating shell (sidebar +
// canvas). Auth screens live outside this route group, so they render without
// the shell. AuthGuard gates the whole group client-side (token in localStorage,
// validated against /api/auth/me).
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  )
}
