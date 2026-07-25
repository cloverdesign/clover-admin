"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SlidersHorizontalIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster } from "@/components/ui/sonner"
import {
  PLAYGROUND_CATEGORIES,
  ALL_SECTIONS,
} from "@/components/playground/registry"
import { Section } from "@/components/playground/section"
import { SECTION_CONTENT } from "@/components/playground/content"
import { ThemeToggle } from "@/components/playground/theme-toggle"
import { OverrideProvider } from "@/components/playground/override-context"
import { TweakPanel } from "@/components/playground/tweak-panel"

export function PlaygroundShell() {
  const [activeSection, setActiveSection] = React.useState<string>(
    ALL_SECTIONS[0]?.id ?? ""
  )
  const [panelOpen, setPanelOpen] = React.useState(true)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Highlight the nav item for whichever section is closest to the top of the
  // scroll viewport.
  React.useEffect(() => {
    const root = scrollRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 }
    )

    for (const section of ALL_SECTIONS) {
      const el = root.querySelector(`#${section.id}`)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    scrollRef.current?.querySelector(`#${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return (
    <OverrideProvider>
    <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-5">
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-lg bg-primary" aria-hidden />
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight">
              Clover Design System
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              playground
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {!panelOpen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPanelOpen(true)}
            >
              <HugeiconsIcon icon={SlidersHorizontalIcon} />
              Tweak
            </Button>
          )}
        </div>
      </header>

      {/* Body: nav · gallery · tweak panel */}
      <div className="flex min-h-0 flex-1">
        <PlaygroundNav
          activeSection={activeSection}
          onSelect={scrollToSection}
        />

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-8 py-10">
            {PLAYGROUND_CATEGORIES.map((category) => (
              <section key={category.id} className="mb-14 last:mb-0">
                <div className="mb-6 flex items-center gap-2">
                  <HugeiconsIcon
                    icon={category.icon}
                    className="size-4 text-muted-foreground"
                  />
                  <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    {category.label}
                  </h2>
                </div>
                <div className="flex flex-col gap-4">
                  {category.sections.map((section) => {
                    const Content = SECTION_CONTENT[section.id]
                    return (
                      <Section key={section.id} section={section}>
                        {Content ? <Content /> : null}
                      </Section>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        {panelOpen && <TweakPanel onClose={() => setPanelOpen(false)} />}
      </div>
      <Toaster />
    </div>
    </OverrideProvider>
  )
}

function PlaygroundNav({
  activeSection,
  onSelect,
}: {
  activeSection: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className="w-60 shrink-0 border-r">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-6 p-4">
          {PLAYGROUND_CATEGORIES.map((category) => (
            <div key={category.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-2 pb-1">
                <HugeiconsIcon
                  icon={category.icon}
                  className="size-3.5 text-muted-foreground"
                />
                <span className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                  {category.label}
                </span>
              </div>
              {category.sections.map((section) => {
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onSelect(section.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <span>{section.label}</span>
                    {section.status === "ready" && (
                      <span className="size-1.5 rounded-full bg-chart-3" />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </nav>
  )
}

