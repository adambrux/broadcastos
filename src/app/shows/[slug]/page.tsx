import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ShowProfilePage } from "@/components/show-profile-page"
import { showProfiles } from "@/lib/mock-data"

type ShowPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return Object.keys(showProfiles).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ShowPageProps): Promise<Metadata> {
  const { slug } = await params
  const show = showProfiles[slug]

  if (!show) return { title: "Show not found" }

  return {
    title: show.title,
    description: `${show.title} — ${show.time} on Premier Gospel.`,
  }
}

export default async function ShowPage({ params }: ShowPageProps) {
  const { slug } = await params
  const show = showProfiles[slug]

  if (!show) notFound()

  return <ShowProfilePage show={show} />
}
