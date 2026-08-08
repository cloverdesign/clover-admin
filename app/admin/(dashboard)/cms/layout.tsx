import { CmsPublishProvider } from "@/components/admin/cms/publish-context"
import { DeployBanner } from "@/components/admin/cms/parts"

/** Wraps the whole CMS section in the shared publish/deploy state so the hub and
 * every editor share one build lifecycle, and surfaces the build banner. */
export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <CmsPublishProvider>
      <DeployBanner />
      {children}
    </CmsPublishProvider>
  )
}
