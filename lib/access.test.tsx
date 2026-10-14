import * as React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen, renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { Admin, Project } from "@/lib/api/models"
import { canAccessAdminRoute } from "@/lib/access"
import { RoleGuard } from "@/components/admin/auth/role-guard"
import { ProjectDetail } from "@/components/admin/projects/project-detail"
import { ProjectsTable } from "@/components/admin/projects/projects-table"
import { useClients } from "@/lib/queries/clients-queries"
import { useAllInvoices } from "@/lib/queries/invoices-queries"
import { useProjects } from "@/lib/queries/projects-queries"
import { ClientsService } from "@/lib/services/clients-service"
import { ProjectsService } from "@/lib/services/projects-service"
import { queryKeys } from "@/lib/api/query-client"

const state = vi.hoisted(() => ({ me: undefined as Admin | undefined, path: "/admin/invoices/secret" }))
vi.mock("@/lib/queries/auth-queries", () => ({ useMe: () => ({ data: state.me }) }))
vi.mock("next/navigation", () => ({ usePathname: () => state.path, useRouter: () => ({ push: vi.fn() }) }))

const admin: Admin = { id: "a", name: "Contributor", email: "a@example.com", role: "ADMIN", approved: true, emailVerified: true, createdAt: "", updatedAt: "" }
const superAdmin: Admin = { ...admin, role: "SUPER_ADMIN" }
const project: Project = { id: "p", clientId: "c", parentProjectId: null, name: "Assigned design", type: "Design", description: "Brief", phase: "Design", status: "IN_PROGRESS", progress: 20, currency: "USD", totalValue: 987654, budget: 40000, startDate: null, endDate: null, archived: false, notes: "Private", createdAt: "", updatedAt: "", assignedAdmins: [admin] }

function harness() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
  qc.setQueryData(queryKeys.projects.all, [project, { ...project, id: "other", assignedAdmins: [] }])
  qc.setQueryData(queryKeys.projects.byId("p"), project)
  qc.setQueryData(queryKeys.projects.milestones("p"), [])
  qc.setQueryData(queryKeys.deliverables.byProject("p"), [])
  qc.setQueryData(queryKeys.clients.all, [{ id: "c", company: "Private client" }])
  qc.setQueryData(queryKeys.projects.invoices("p"), [{ id: "secret-invoice", amount: 987654 }])
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  return { wrapper }
}

describe("contributor access", () => {
  it.each(["/admin/clients", "/admin/clients/new-project", "/admin/invoices/secret", "/admin/projects/new", "/admin/projects/p/edit", "/admin/team", "/admin/cms/pages", "/admin/settings", "/admin/revisions/r", "/admin/future-feature"])("blocks direct navigation to %s", (path) => {
    expect(canAccessAdminRoute(admin, path)).toBe(false)
    expect(canAccessAdminRoute(superAdmin, path)).toBe(true)
  })

  it.each(["/admin", "/admin/projects", "/admin/projects/p", "/admin/calendar", "/admin/deliverables/new", "/admin/deliverables/d/edit"])("allows delivery route %s", (path) => {
    expect(canAccessAdminRoute(admin, path)).toBe(true)
    expect(canAccessAdminRoute(undefined, path)).toBe(false)
    expect(canAccessAdminRoute({ ...superAdmin, approved: false }, path)).toBe(false)
  })

  it("does not mount a restricted page or its data hooks", () => {
    state.me = admin
    const mounted = vi.fn()
    function RestrictedPage() { mounted(); return <p>Commercial data</p> }
    render(<RoleGuard><RestrictedPage /></RoleGuard>)
    expect(screen.getByText("Access restricted")).toBeInTheDocument()
    expect(mounted).not.toHaveBeenCalled()
  })

  it("removes monetary table columns immediately after role downgrade", () => {
    state.me = superAdmin
    const { rerender } = render(<ProjectsTable data={[project]} clientName={() => ""} />)
    expect(screen.getByText("Value")).toBeInTheDocument()
    state.me = admin
    rerender(<ProjectsTable data={[project]} clientName={() => ""} />)
    expect(screen.queryByText("Value")).not.toBeInTheDocument()
    expect(screen.getByText("Assigned design")).toBeInTheDocument()
    expect(document.body.textContent).not.toContain("987")
  })

  it("hides cached client/invoice data and never requests it for contributors", () => {
    state.me = admin
    const clientRead = vi.spyOn(ClientsService, "list")
    const invoiceRead = vi.spyOn(ProjectsService, "invoices")
    const { wrapper } = harness()
    const { result } = renderHook(() => ({ clients: useClients(), invoices: useAllInvoices(), projects: useProjects() }), { wrapper })
    expect(result.current.clients.data).toBeUndefined()
    expect(result.current.invoices.invoices).toEqual([])
    expect(result.current.projects.data?.map((p) => p.id)).toEqual(["p"])
    expect(clientRead).not.toHaveBeenCalled()
    expect(invoiceRead).not.toHaveBeenCalled()
  })
})


it("shows the project brief and delivery actions without commercial or management controls", () => {
  state.me = admin
  const { wrapper } = harness()
  render(<ProjectDetail id="p" />, { wrapper })
  expect(screen.getByText("Brief", { selector: "p" })).toBeInTheDocument()
  expect(screen.getByText("Add deliverable")).toBeInTheDocument()
  for (const text of ["Invoices", "Value", "Team", "Private", "Private client"]) {
    expect(screen.queryByText(text)).not.toBeInTheDocument()
  }
  expect(screen.queryByLabelText("Project actions")).not.toBeInTheDocument()
  expect(screen.queryByLabelText("Edit details")).not.toBeInTheDocument()
  expect(screen.queryByPlaceholderText("New milestone")).not.toBeInTheDocument()
})
