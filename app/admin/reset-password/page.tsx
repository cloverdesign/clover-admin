import { Suspense } from "react"
import type { Metadata } from "next"

import { ResetPassword } from "@/components/admin/auth/reset-password"

export const metadata: Metadata = {
  title: "Clover Admin — Reset password",
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  )
}
