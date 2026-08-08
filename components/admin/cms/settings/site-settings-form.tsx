"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { RocketIcon, Mail01Icon, GlobalIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/admin/clients/new-client/fields"
import { PanelCard } from "@/components/admin/dashboard/cards"
import { SITE_SETTINGS } from "@/lib/mock/cms"
import { useCmsPublish } from "@/components/admin/cms/publish-context"

/**
 * Site settings — the site-wide values (contact, socials, footer) that aren't
 * tied to a single page. Save stores the change; Publish pushes it live via a
 * Vercel rebuild (PRD §2.3).
 */
export function SiteSettingsForm() {
  const router = useRouter()
  const { publish, building } = useCmsPublish()

  const [contactEmail, setContactEmail] = React.useState(SITE_SETTINGS.contactEmail)
  const [phone, setPhone] = React.useState(SITE_SETTINGS.phone)
  const [instagram, setInstagram] = React.useState(SITE_SETTINGS.socials.instagram)
  const [linkedin, setLinkedin] = React.useState(SITE_SETTINGS.socials.linkedin)
  const [x, setX] = React.useState(SITE_SETTINGS.socials.x)
  const [footerText, setFooterText] = React.useState(SITE_SETTINGS.footerText)

  const valid = /.+@.+\..+/.test(contactEmail)

  const save = () => toast.success("Saved site settings")
  const doPublish = () => {
    publish("Published site settings")
    router.push("/admin/cms")
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <PanelCard icon={Mail01Icon} title="Contact">
        <div className="flex flex-col gap-4">
          <Field label="Contact email" htmlFor="s-email">
            <Input id="s-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </Field>
          <Field label="Phone" htmlFor="s-phone">
            <Input id="s-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
      </PanelCard>

      <PanelCard icon={GlobalIcon} title="Social links">
        <div className="flex flex-col gap-4">
          <Field label="Instagram" htmlFor="s-ig">
            <Input id="s-ig" value={instagram} onChange={(e) => setInstagram(e.target.value)} inputMode="url" />
          </Field>
          <Field label="LinkedIn" htmlFor="s-li">
            <Input id="s-li" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} inputMode="url" />
          </Field>
          <Field label="X" htmlFor="s-x">
            <Input id="s-x" value={x} onChange={(e) => setX(e.target.value)} inputMode="url" />
          </Field>
        </div>
      </PanelCard>

      <PanelCard icon={GlobalIcon} title="Footer">
        <Field label="Footer text" htmlFor="s-footer">
          <Textarea id="s-footer" value={footerText} onChange={(e) => setFooterText(e.target.value)} className="min-h-16" />
        </Field>
      </PanelCard>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={save} disabled={!valid}>
          Save
        </Button>
        <Button className="gap-1.5" onClick={doPublish} disabled={!valid || building}>
          <HugeiconsIcon icon={RocketIcon} data-icon="inline-start" className="size-4" />
          Publish
        </Button>
      </div>
    </div>
  )
}
