import type { Metadata } from "next"

import { ForgotPassword } from "@/components/admin/auth/forgot-password"

export const metadata: Metadata = {
  title: "Clover Admin — Forgot password",
}

export default function AdminForgotPasswordPage() {
  return <ForgotPassword />
}
