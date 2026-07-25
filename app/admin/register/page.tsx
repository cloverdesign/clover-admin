import type { Metadata } from "next"

import { Register } from "@/components/admin/auth/register"

export const metadata: Metadata = {
  title: "Clover Admin — Create account",
}

export default function AdminRegisterPage() {
  return <Register />
}
