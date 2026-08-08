import type { Metadata } from "next"

import { getTestimonial } from "@/lib/mock/cms"
import { TestimonialEditor } from "@/components/admin/cms/testimonials/testimonial-editor"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const t = getTestimonial(id)
  return { title: t ? `${t.author} — Site CMS` : "Testimonial — Site CMS" }
}

export default async function TestimonialEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TestimonialEditor id={id} />
}
