/**
 * TEMPORARY: works out an ADMIN's permission keys on the frontend, because
 * `GET /api/auth/me` doesn't return them yet. Remove this once the backend
 * sends effective permissions on `/me` (see docs/admin-access-backend.md).
 *
 * It tries each source in turn and stops at the first that answers:
 * 1. Keys embedded in `me.assignedRole.permissionKeys`.
 * 2. `GET /api/admins/{id}`, if `/me` didn't say which role is assigned.
 * 3. `GET /api/roles/{assignedRoleId}`.
 *
 * Steps 2 and 3 are super-admin only in today's spec, so for an ADMIN they
 * usually fail with 403. Every failure leaves `effectivePermissions` unset,
 * and `lib/access.ts` then falls back to the seeded ADMIN defaults. The
 * result is never less access than before this change, and custom roles take
 * effect as soon as the backend opens any one of these sources.
 */

import type { Admin } from "@/lib/api/models"
import { AdminsService } from "@/lib/services/admins-service"
import { RolesService } from "@/lib/services/roles-service"

export async function withEffectivePermissions(me: Admin): Promise<Admin> {
  if (me.role !== "ADMIN" || me.effectivePermissions) return me

  let assigned = me.assignedRole
  if (assigned === undefined) {
    try {
      assigned = (await AdminsService.getById(me.id)).assignedRole
    } catch {
      return me
    }
  }
  // `null` means no role. What that grants is still unconfirmed, so keep
  // the defaults rather than locking the admin out.
  if (!assigned) return { ...me, assignedRole: assigned }

  if (assigned.permissionKeys) {
    return { ...me, assignedRole: assigned, effectivePermissions: assigned.permissionKeys }
  }
  try {
    const role = await RolesService.getById(assigned.id)
    return { ...me, assignedRole: assigned, effectivePermissions: role.permissionKeys }
  } catch {
    return { ...me, assignedRole: assigned }
  }
}
