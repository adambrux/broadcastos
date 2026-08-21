import type { Metadata } from "next"

import { PodcastModePage } from "@/components/podcast-mode"

export const metadata: Metadata = {
  title: "Podcast",
}

export default function Page() {
  return <PodcastModePage />
}
