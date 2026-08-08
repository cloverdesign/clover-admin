import { redirect } from "next/navigation"

/** Root entry — send everyone to the admin app. The dashboard-group AuthGuard
 * then routes to the dashboard (authenticated) or /admin/login (not). */
export default function RootPage() {
  redirect("/admin")
}
