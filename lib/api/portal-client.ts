/**
 * Axios instance for the client portal — a sibling of `apiClient` that injects
 * the portal session token (not the admin one) and clears it on 401 so the
 * portal guard can bounce to re-auth. Same base URL and error normalization.
 */

import axios, { AxiosError } from "axios"

import type { ApiError } from "@/lib/api/types"
import { getPortalToken, clearPortalToken } from "@/lib/api/portal-auth-storage"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.cloverdesign.xyz"

export const portalClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
})

portalClient.interceptors.request.use(
  (config) => {
    const token = getPortalToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Let the browser set the multipart boundary for file uploads.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]
    }
    return config
  },
  (error) => Promise.reject(error)
)

portalClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status ?? 500
    // A rejected token — drop it so the portal can re-verify by email.
    if (status === 401) clearPortalToken()
    const apiError: ApiError = {
      message: error.response?.data?.message ?? error.message ?? "Request failed",
      status,
      code: error.code ?? status,
    }
    return Promise.reject(apiError)
  }
)
