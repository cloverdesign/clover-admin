import type { Metadata } from "next"

import { NewProjectWizard } from "@/components/admin/projects/new-project/new-project-wizard"

export const metadata: Metadata = {
  title: "New project — Clover Admin",
}

const STEPS = ["client", "project", "milestones"] as const
type Step = (typeof STEPS)[number]

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; step?: string }>
}) {
  const { client, step } = await searchParams
  const initialStep = STEPS.includes(step as Step) ? (step as Step) : undefined
  return <NewProjectWizard initialClientId={client} initialStep={initialStep} />
}
