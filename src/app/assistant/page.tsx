import type { Metadata } from "next"

import { ProductionIntelligencePage } from "@/components/production-intelligence-page"

export const metadata: Metadata = { title: "Production Intelligence" }

export default function AssistantPage() {
  return <ProductionIntelligencePage />
}
