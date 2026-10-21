"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Building06Icon,
  Clock01Icon,
  InformationCircleIcon,
  Settings01Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CURRENCIES } from "@/lib/mock/currencies"

const fieldClass = "grid gap-2"

export function SettingsPage() {
  const [workspaceName, setWorkspaceName] = React.useState("Clover")
  const [contactEmail, setContactEmail] = React.useState("")
  const [timezone, setTimezone] = React.useState("Africa/Lagos")
  const [defaultCurrency, setDefaultCurrency] = React.useState("USD")
  const [dateFormat, setDateFormat] = React.useState("DD MMM YYYY")

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Settings01Icon} className="size-4" />
            Workspace
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Set shared workspace details and defaults for the Clover team.
          </p>
        </div>
        <Badge variant="warning">Backend setup required</Badge>
      </header>

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400"
        />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Settings are a frontend preview. The backend settings API is not connected,
          so edits cannot be saved or shared with other admins yet.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Building06Icon} className="size-5" />
            </div>
            <div>
              <CardTitle>Workspace profile</CardTitle>
              <CardDescription className="mt-1">
                Identity and contact details used across the admin workspace.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
          <div className={fieldClass}>
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Clover"
            />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="contact-email">Workspace contact email</Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="hello@example.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} className="size-5" />
            </div>
            <div>
              <CardTitle>Regional defaults</CardTitle>
              <CardDescription className="mt-1">
                Defaults used for dates and new financial records. Existing records keep their own currency.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-3">
          <div className={fieldClass}>
            <Label htmlFor="timezone">Workspace timezone</Label>
            <select
              id="timezone"
              className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
            >
              <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className={fieldClass}>
            <Label htmlFor="default-currency">Default currency</Label>
            <select
              id="default-currency"
              className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={defaultCurrency}
              onChange={(event) => setDefaultCurrency(event.target.value)}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} — {currency.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Separate from your personal display currency in the top bar.
            </p>
          </div>
          <div className={fieldClass}>
            <Label htmlFor="date-format">Date format</Label>
            <select
              id="date-format"
              className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={dateFormat}
              onChange={(event) => setDateFormat(event.target.value)}
            >
              <option value="DD MMM YYYY">21 Oct 2026</option>
              <option value="MMM D, YYYY">Oct 21, 2026</option>
              <option value="YYYY-MM-DD">2026-10-21</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className="bg-muted/20">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-start gap-3">
            <HugeiconsIcon
              icon={ShieldKeyIcon}
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
            <div>
              <p className="text-sm font-medium">Who can change these settings?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Access is controlled by the workspace settings permission on a role.
              </p>
            </div>
          </div>
          <Badge variant="secondary">workspace.settings</Badge>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled title="Saving will be enabled when the backend settings API is available">
          Save settings
        </Button>
      </div>
    </div>
  )
}
