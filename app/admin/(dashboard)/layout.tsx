import { AdminShell } from "@/components/admin/shell/admin-shell"

// Wraps every authenticated admin route in the floating shell (sidebar +
// canvas). Auth screens live outside this route group, so they render without
// the shell. Route protection is added separately.
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
