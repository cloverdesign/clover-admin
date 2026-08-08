/**
 * The single axios instance every service calls through. Mirrors the ocare-admin
 * setup: a request interceptor injects the bearer token (and lets the browser set
 * the multipart boundary for FormData), and a response interceptor normalizes
 * failures into `ApiError`. Base URL is the Clover CMS API; paths carry `/api`.
 */

import axios, { AxiosError } from "axios"

import type { ApiError } from "@/lib/api/types"
import { getToken, clearToken } from "@/lib/api/auth-storage"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.cloverdesign.xyz"

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
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

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status ?? 500
    // A rejected token — drop it so the app can re-auth.
    if (status === 401) clearToken()
    const apiError: ApiError = {
      message: error.response?.data?.message ?? error.message ?? "Request failed",
      status,
      code: error.code ?? status,
    }
    return Promise.reject(apiError)
  }
)
