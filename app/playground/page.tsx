import type { Metadata } from "next"

import { PlaygroundShell } from "@/components/playground/playground-shell"

export const metadata: Metadata = {
  title: "Clover Design System — Playground",
}

export default function PlaygroundPage() {
  return <PlaygroundShell />
}
