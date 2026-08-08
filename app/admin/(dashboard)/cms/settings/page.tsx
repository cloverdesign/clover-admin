import type { Metadata } from "next"

import { SiteSettingsForm } from "@/components/admin/cms/settings/site-settings-form"

export const metadata: Metadata = {
  title: "Site settings — Site CMS",
}

export default function CmsSettingsPage() {
  return <SiteSettingsForm />
}
