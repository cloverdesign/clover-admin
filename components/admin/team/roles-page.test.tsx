import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RolesPage } from "./roles-page"
import { INITIAL_ROLES, togglePermission } from "@/lib/role-drafts"

vi.mock("@/lib/queries/auth-queries", () => ({
  useMe: () => ({
    data: {
      id: "owner",
      role: "SUPER_ADMIN",
      approved: true,
      emailVerified: true,
    },
  }),
}))
vi.mock("@/lib/queries/admins-queries", () => ({
  useAdmins: () => ({ data: [] }),
}))
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/team/roles" }))

beforeEach(() => {
  cleanup()
  localStorage.clear()
})

describe("role design drafts", () => {
  it("adds view prerequisites and removes dependent permissions transitively", () => {
    const enabled = togglePermission([], "invoices.manage", true)
    expect(enabled).toEqual(
      expect.arrayContaining([
        "projects.view",
        "invoices.view",
        "invoices.manage",
      ])
    )
    expect(togglePermission(enabled, "projects.view", false)).toEqual([])
  })

  it("reviews and saves a monetary permission draft without changing live policy", async () => {
    const user = userEvent.setup()
    render(<RolesPage />)
    expect(
      screen.getByRole("switch", { name: "View project monetary values" })
    ).not.toBeChecked()
    await user.click(
      screen.getByRole("switch", { name: "Edit project monetary values" })
    )
    expect(
      screen.getByRole("switch", { name: "View project monetary values" })
    ).toBeChecked()
    await user.click(screen.getByRole("button", { name: "Review changes" }))
    expect(
      screen.getByText("Allow: View project monetary values")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Allow: Edit project monetary values")
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Save draft" }))
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Draft saved in this browser"
      )
    )
    const stored = JSON.parse(
      localStorage.getItem("clover.role-drafts.v1.owner")!
    )
    expect(
      stored.find((r: { id: string }) => r.id === "ADMIN").permissions
    ).toContain("finance.edit")
    expect(INITIAL_ROLES[1].permissions).not.toContain("finance.edit")
  })

  it("creates a custom role from Admin and discards an unsaved role", async () => {
    const user = userEvent.setup()
    render(<RolesPage />)
    await user.click(screen.getByRole("button", { name: "Create role" }))
    await user.type(
      screen.getByLabelText("Role name", { selector: "input#new-role-name" }),
      "Project manager"
    )
    await user.click(screen.getByRole("button", { name: "Create draft" }))
    expect(
      screen.getByRole("heading", { name: "Project manager" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("switch", { name: "View project monetary values" })
    ).not.toBeChecked()
    await user.click(screen.getByRole("button", { name: "Discard" }))
    expect(
      screen.queryByRole("heading", { name: "Project manager" })
    ).not.toBeInTheDocument()
  })

  it("keeps Super admin immutable and supports searching its permissions", async () => {
    const user = userEvent.setup()
    render(<RolesPage />)
    await user.click(
      screen.getByRole("button", { name: /Super admin Full access/ })
    )
    for (const control of screen.getAllByRole("switch"))
      expect(control).toHaveAttribute("aria-disabled", "true")
    await user.type(
      screen.getByRole("textbox", { name: "Search permissions" }),
      "monetary"
    )
    expect(screen.getAllByRole("switch")).toHaveLength(2)
    expect(screen.getByRole("button", { name: "Duplicate role" })).toBeEnabled()
  })
})
