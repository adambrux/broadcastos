import type { Metadata } from "next"

import { BroadcastBrainPage } from "@/components/broadcast-brain-page"

export const metadata: Metadata = { title: "Broadcast Brain" }

export default function BrainPage() {
  return <BroadcastBrainPage />
}
