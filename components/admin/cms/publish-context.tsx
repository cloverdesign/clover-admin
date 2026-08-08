"use client"

import * as React from "react"
import { toast } from "sonner"

import { DEPLOY, unpublishedCount, type DeployStatus } from "@/lib/mock/cms"

/**
 * Shared publish/deploy state for the whole CMS section. The marketing site is
 * static on Vercel, so "Publish" doesn't go live instantly — it triggers a
 * deploy hook and a rebuild (PRD §2.3). No backend here: `publish()` simulates
 * the QUEUED → BUILDING → LIVE lifecycle with timers so the hub and every
 * editor can show a build-in-progress state and confirm once live.
 */

type CmsPublishValue = {
  status: DeployStatus
  /** Count of content items with unpublished changes. */
  unpublished: number
  lastDeployAt: string
  building: boolean
  /** Kick off a deploy. `label` describes what triggered it. */
  publish: (label?: string) => void
}

const CmsPublishContext = React.createContext<CmsPublishValue | null>(null)

export function CmsPublishProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<DeployStatus>(DEPLOY.status)
  const [unpublished, setUnpublished] = React.useState(() => unpublishedCount())
  const [lastDeployAt, setLastDeployAt] = React.useState(DEPLOY.at)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])

  React.useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  const publish = React.useCallback(
    (label?: string) => {
      setStatus((current) => {
        if (current === "QUEUED" || current === "BUILDING") {
          toast.info("A deploy is already in progress")
          return current
        }
        toast.success(
          label ? `${label} — deploying to Vercel…` : "Publishing to Vercel…"
        )
        timers.current.push(
          setTimeout(() => setStatus("BUILDING"), 500),
          setTimeout(() => {
            setStatus("LIVE")
            setUnpublished(0)
            setLastDeployAt(new Date().toISOString())
            toast.success("Site is live", {
              description: "The marketing site finished deploying.",
            })
          }, 3200)
        )
        return "QUEUED"
      })
    },
    []
  )

  const value: CmsPublishValue = {
    status,
    unpublished,
    lastDeployAt,
    building: status === "QUEUED" || status === "BUILDING",
    publish,
  }

  return (
    <CmsPublishContext.Provider value={value}>
      {children}
    </CmsPublishContext.Provider>
  )
}

export function useCmsPublish(): CmsPublishValue {
  const ctx = React.useContext(CmsPublishContext)
  if (!ctx) {
    throw new Error("useCmsPublish must be used within CmsPublishProvider")
  }
  return ctx
}
