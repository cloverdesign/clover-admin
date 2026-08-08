/**
 * Auth transport. Login returns a loosely-typed `data` object; we pull the token
 * out defensively and hand it to the caller (the hook persists it).
 */

import { apiClient } from "@/lib/api/client"
import { AuthEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type { Admin, LoginResult } from "@/lib/api/models"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResult> {
    const res = await apiClient.post<ApiEnvelope<LoginResult>>(
      AuthEndpoints.login,
      credentials
    )
    return res.data.data
  }

  /** Register a new admin. Accounts start unapproved (`data` is null); the UI
   * shows the pending-approval notice. */
  static async register(input: RegisterInput): Promise<void> {
    await apiClient.post<ApiEnvelope<null>>(AuthEndpoints.register, input)
  }

  static async me(): Promise<Admin> {
    const res = await apiClient.get<ApiEnvelope<Admin>>(AuthEndpoints.me)
    return res.data.data
  }
}

/** Pull a token out of the (loosely specced) login payload. */
export function tokenFromLogin(result: LoginResult): string | undefined {
  return result.token ?? result.accessToken
}
