import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, cleanup, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RolesPage } from "./roles-page"
import { draftFromRole, permissionKeys, togglePermission } from "@/lib/role-drafts"
import type { Role } from "@/lib/api/models"

const saveMutate = vi.fn()
const deleteMutate = vi.fn()
let roles: Role[] = []

const role = (overrides: Partial<Role>): Role => ({
  id: "r1",
  name: "Project manager",
  description: null,
  permissionKeys: ["projects.view", "projects.progress"],
  adminCount: 2,
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
  ...overrides,
})

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
vi.mock("@/lib/queries/roles-queries", () => ({
  useRoles: () => ({ data: roles, isLoading: false, isError: false }),
  useSaveRole: () => ({ mutate: saveMutate, isPending: false }),
  useDeleteRole: () => ({ mutate: deleteMutate, isPending: false }),
}))
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/team/roles" }))

beforeEach(() => {
  cleanup()
  saveMutate.mockReset()
  deleteMutate.mockReset()
  roles = [role({})]
})

describe("role catalog helpers", () => {
  it("adds view prerequisites and removes dependent permissions transitively", () => {
    const enabled = togglePermission([], "invoices.manage", true)
    expect(enabled).toEqual(
      expect.arrayContaining(["projects.view", "invoices.view", "invoices.manage"])
    )
    expect(togglePermission(enabled, "projects.view", false)).toEqual([])
  })

  it("keeps API keys the catalog doesn't know about", () => {
    const draft = draftFromRole(
      role({ permissionKeys: ["projects.view", "projects.write"] })
    )
    expect(draft.permissions).toEqual(["projects.view"])
    expect(draft.otherKeys).toEqual(["projects.write"])
    expect(permissionKeys(draft)).toEqual(["projects.view", "projects.write"])
  })
})

describe("roles page", () => {
  it("saves only the permission set when only permissions changed", async () => {
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
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByText("Allow: Edit project monetary values")).toBeInTheDocument()
    expect(within(dialog).getByText(/apply immediately to the 2 admins/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Save role" }))
    expect(saveMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "r1",
        name: "Project manager",
        permissionKeys: expect.arrayContaining(["finance.view", "finance.edit"]),
        changed: { details: false, permissions: true },
      }),
      expect.anything()
    )
  })

  it("never sends roles.manage, even when duplicating Super admin", async () => {
    const user = userEvent.setup()
    render(<RolesPage />)
    await user.click(screen.getByRole("button", { name: /Super admin Full access/ }))
    for (const control of screen.getAllByRole("switch"))
      expect(control).toHaveAttribute("aria-disabled", "true")
    await user.click(screen.getByRole("button", { name: "Duplicate role" }))
    await user.type(
      screen.getByLabelText("Role name", { selector: "input#new-role-name" }),
      "Studio lead"
    )
    await user.click(screen.getByRole("button", { name: "Continue" }))
    await user.click(screen.getByRole("button", { name: "Review changes" }))
    await user.click(screen.getByRole("button", { name: "Create role" }))
    const [input] = saveMutate.mock.calls[0]
    expect(input.id).toBeUndefined()
    expect(input.name).toBe("Studio lead")
    expect(input.permissionKeys).toContain("invoices.manage")
    expect(input.permissionKeys).not.toContain("roles.manage")
  })

  it("discards an unsaved new role", async () => {
    const user = userEvent.setup()
    render(<RolesPage />)
    await user.click(screen.getAllByRole("button", { name: "Create role" })[0])
    await user.type(
      screen.getByLabelText("Role name", { selector: "input#new-role-name" }),
      "Contractor"
    )
    await user.click(screen.getByRole("button", { name: "Continue" }))
    expect(screen.getByRole("heading", { name: "Contractor" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Discard" }))
    expect(screen.queryByRole("heading", { name: "Contractor" })).not.toBeInTheDocument()
    expect(saveMutate).not.toHaveBeenCalled()
  })

  it("rejects a name another role already uses", async () => {
    roles = [role({}), role({ id: "r2", name: "Studio ops" })]
    const user = userEvent.setup()
    render(<RolesPage />)
    const name = screen.getByLabelText("Role name", { selector: "input#role-name" })
    await user.clear(name)
    await user.type(name, "studio OPS")
    expect(screen.getByText("A role with this name already exists.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Review changes" })).toBeDisabled()
  })

  it("warns how many admins lose the role before deleting", async () => {
    const user = userEvent.setup()
    render(<RolesPage />)
    await user.click(screen.getByRole("button", { name: "Delete" }))
    expect(screen.getByText(/2 admins have this role/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Delete role" }))
    expect(deleteMutate).toHaveBeenCalledWith("r1", expect.anything())
  })
})
