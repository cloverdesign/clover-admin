import type { Metadata } from "next"

import { TestimonialsList } from "@/components/admin/cms/testimonials/testimonials-list"

export const metadata: Metadata = {
  title: "Testimonials — Site CMS",
}

export default function CmsTestimonialsPage() {
  return <TestimonialsList />
}
