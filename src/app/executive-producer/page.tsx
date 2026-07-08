import type { Metadata } from "next"

import { ExecutiveProducerPage } from "@/components/executive-producer-page"

export const metadata: Metadata = { title: "Executive Producer" }
export const dynamic = "force-dynamic"

export default function ExecutiveProducerRoute() {
  return <ExecutiveProducerPage initialNow={new Date().toISOString()} />
}
