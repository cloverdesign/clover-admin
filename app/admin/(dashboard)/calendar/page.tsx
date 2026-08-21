import type { Metadata } from "next"

import { CalendarPage } from "@/components/admin/calendar/calendar-page"

export const metadata: Metadata = {
  title: "Calendar — Clover Admin",
}

export default function AdminCalendarPage() {
  return <CalendarPage />
}
