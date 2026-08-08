import type { Metadata } from "next"

import { TestimonialEditor } from "@/components/admin/cms/testimonials/testimonial-editor"

export const metadata: Metadata = {
  title: "New testimonial — Site CMS",
}

export default function NewTestimonialPage() {
  return <TestimonialEditor />
}
