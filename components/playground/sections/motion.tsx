"use client"

import dynamic from "next/dynamic"

/**
 * Client-only entry for the DialKit specimen. DialKit reads live values from a
 * browser store, so we skip SSR to avoid a hydration mismatch and show a light
 * placeholder while it loads.
 */
const MotionDemo = dynamic(
  () => import("./motion-demo").then((m) => m.MotionDemo),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[300px] rounded-xl border bg-muted/30" />
    ),
  }
)

export function MotionSection() {
  return <MotionDemo />
}
