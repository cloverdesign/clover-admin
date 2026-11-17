import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Admin, Role } from "@/lib/api/models"
import { canAccessAdminRoute } from "@/lib/access"
import { AdminsService } from "@/lib/services/admins-service"
import { RolesService } from "@/lib/services/roles-service"
import { withEffectivePermissions } from "@/lib/services/effective-permissions"

const admin: Admin = {
  id: "a",
  name: "Contributor",
  email: "a@example.com",
  role: "ADMIN",
  approved: true,
  emailVerified: true,
  createdAt: "",
  updatedAt: "",
}
const financeRole: Role = {
  id: "r1",
  name: "Finance",
  description: null,
  permissionKeys: ["invoices.view"],
  adminCount: 1,
  createdAt: "",
  updatedAt: "",
}
const forbidden = { message: "Forbidden", status: 403, code: 403 }

beforeEach(() => vi.restoreAllMocks())

describe("withEffectivePermissions", () => {
  it("leaves super admins alone", async () => {
    const getRole = vi.spyOn(RolesService, "getById")
    const me = { ...admin, role: "SUPER_ADMIN" as const }
    expect(await withEffectivePermissions(me)).toBe(me)
    expect(getRole).not.toHaveBeenCalled()
  })

  it("uses keys embedded on the assigned role without a request", async () => {
    const getRole = vi.spyOn(RolesService, "getById")
    const me = { ...admin, assignedRole: { id: "r1", name: "Finance", permissionKeys: ["invoices.view"] } }
    const result = await withEffectivePermissions(me)
    expect(result.effectivePermissions).toEqual(["invoices.view"])
    expect(getRole).not.toHaveBeenCalled()
  })

  it("reads the role's keys when the role endpoint answers", async () => {
    vi.spyOn(RolesService, "getById").mockResolvedValue(financeRole)
    const result = await withEffectivePermissions({ ...admin, assignedRole: { id: "r1", name: "Finance" } })
    expect(result.effectivePermissions).toEqual(["invoices.view"])
    expect(canAccessAdminRoute(result, "/admin/invoices")).toBe(true)
    expect(canAccessAdminRoute(result, "/admin/projects")).toBe(false)
  })

  it("looks up the admin detail when /me omits assignedRole", async () => {
    vi.spyOn(AdminsService, "getById").mockResolvedValue({ ...admin, assignedRole: { id: "r1", name: "Finance" } })
    vi.spyOn(RolesService, "getById").mockResolvedValue(financeRole)
    const result = await withEffectivePermissions(admin)
    expect(result.assignedRole?.name).toBe("Finance")
    expect(result.effectivePermissions).toEqual(["invoices.view"])
  })

  it("falls back to the seeded defaults when the role endpoint refuses", async () => {
    vi.spyOn(RolesService, "getById").mockRejectedValue(forbidden)
    const result = await withEffectivePermissions({ ...admin, assignedRole: { id: "r1", name: "Finance" } })
    expect(result.effectivePermissions).toBeUndefined()
    expect(canAccessAdminRoute(result, "/admin/projects")).toBe(true)
    expect(canAccessAdminRoute(result, "/admin/invoices")).toBe(false)
  })

  it("falls back when the admin detail refuses", async () => {
    vi.spyOn(AdminsService, "getById").mockRejectedValue(forbidden)
    const getRole = vi.spyOn(RolesService, "getById")
    expect(await withEffectivePermissions(admin)).toBe(admin)
    expect(getRole).not.toHaveBeenCalled()
  })

  it("keeps the defaults for an admin with no role", async () => {
    const getRole = vi.spyOn(RolesService, "getById")
    const result = await withEffectivePermissions({ ...admin, assignedRole: null })
    expect(result.effectivePermissions).toBeUndefined()
    expect(getRole).not.toHaveBeenCalled()
  })
})
