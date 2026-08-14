/**
 * Admin auth transport. Two-step flows: register → verify-email (→ JWT), and
 * login validates the password and emails an OTP → verify-otp (→ JWT). Password
 * login alone does NOT return a token. All unwrap the `{ success, message, data }`
 * envelope.
 */

import { apiClient } from "@/lib/api/client"
import { AuthEndpoints } from "@/lib/api/endpoints"
import type { ApiEnvelope } from "@/lib/api/types"
import type {
  Admin,
  AdminAuthResult,
  LoginCredentialsInput,
  LoginOtpVerifyInput,
  RegisterInput,
  EmailVerifyInput,
} from "@/lib/api/models"

export type { LoginCredentialsInput as LoginCredentials, RegisterInput }

export class AuthService {
  /** Step 1 of login — validates the password and emails a 6-digit OTP. Returns
   * no token; call `verifyOtp` with the emailed code. */
  static async login(credentials: LoginCredentialsInput): Promise<void> {
    await apiClient.post<ApiEnvelope<{ message: string }>>(
      AuthEndpoints.login,
      credentials
    )
  }

  /** Step 2 of login — exchange the emailed OTP for a 7-day JWT. */
  static async verifyOtp(input: LoginOtpVerifyInput): Promise<AdminAuthResult> {
    const res = await apiClient.post<ApiEnvelope<AdminAuthResult>>(
      AuthEndpoints.verifyOtp,
      input
    )
    return res.data.data
  }

  /** Create an account — sends a verification email. No token yet. */
  static async register(input: RegisterInput): Promise<void> {
    await apiClient.post<ApiEnvelope<{ message: string }>>(
      AuthEndpoints.register,
      input
    )
  }

  /** Verify the email via the token from the link — returns a JWT (signed in). */
  static async verifyEmail(input: EmailVerifyInput): Promise<AdminAuthResult> {
    const res = await apiClient.post<ApiEnvelope<AdminAuthResult>>(
      AuthEndpoints.verifyEmail,
      input
    )
    return res.data.data
  }

  static async me(): Promise<Admin> {
    const res = await apiClient.get<ApiEnvelope<Admin>>(AuthEndpoints.me)
    return res.data.data
  }
}
