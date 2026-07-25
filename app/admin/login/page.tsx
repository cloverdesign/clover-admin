import type { Metadata } from "next"

import { Login } from "@/components/admin/auth/login"

export const metadata: Metadata = {
  title: "Clover Admin — Sign in",
}

export default function AdminLoginPage() {
  return <Login />
}
