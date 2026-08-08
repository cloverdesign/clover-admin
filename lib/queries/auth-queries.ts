/**
 * Auth hooks. `useLogin` persists the returned token so the axios interceptor
 * picks it up on subsequent requests; `useMe` reads the signed-in admin. The
 * login page still uses dummy navigation — wiring it to `useLogin` is a one-line
 * follow-up once the real auth flow is turned on.
 */

import { useMutation, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-client"
import {
  AuthService,
  tokenFromLogin,
  type LoginCredentials,
  type RegisterInput,
} from "@/lib/services/auth-service"
import { setToken, getToken } from "@/lib/api/auth-storage"

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => AuthService.login(credentials),
    meta: {
      successMessage: "Signed in.",
      errorMessage: "Sign in failed. Check your email and password.",
    },
    onSuccess: (result) => {
      const token = tokenFromLogin(result)
      if (token) setToken(token)
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

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => AuthService.me(),
    enabled: Boolean(getToken()),
    meta: { silent: true },
  })
}
