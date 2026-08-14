/**
 * Admin auth hooks. Login is two-step (password → emailed OTP → verify-otp mints
 * the JWT); registration verifies email (which also mints a JWT). The token-
 * minting hooks persist the token and seed the `me` cache so the guard sees the
 * signed-in admin immediately. `useMe` reads the profile (incl. `approved` /
 * `emailVerified`, which the guard gates on).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import { AuthService } from "@/lib/services/auth-service"
import { setToken, getToken } from "@/lib/api/auth-storage"
import type {
  LoginCredentialsInput,
  LoginOtpVerifyInput,
  RegisterInput,
  EmailVerifyInput,
} from "@/lib/api/models"

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentialsInput) => AuthService.login(credentials),
    meta: {
      successMessage: "Code sent — check your email.",
      errorMessage: "Sign in failed. Check your email and password.",
    },
  })
}

export function useVerifyOtp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginOtpVerifyInput) => AuthService.verifyOtp(input),
    meta: {
      successMessage: "Signed in.",
      errorMessage: "That code didn’t work. Check it and try again.",
    },
    onSuccess: (result) => {
      setToken(result.token)
      qc.setQueryData(queryKeys.auth.me, result.admin)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => AuthService.register(input),
    meta: {
      errorMessage: "Couldn’t create your account. Please try again.",
    },
  })
}

export function useVerifyEmail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: EmailVerifyInput) => AuthService.verifyEmail(input),
    meta: {
      successMessage: "Email verified.",
      errorMessage: "This verification link is invalid or has expired.",
    },
    onSuccess: (result) => {
      setToken(result.token)
      qc.setQueryData(queryKeys.auth.me, result.admin)
    },
  })
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => AuthService.me(),
    enabled: Boolean(getToken()),
    meta: { silent: true },
  })
}
