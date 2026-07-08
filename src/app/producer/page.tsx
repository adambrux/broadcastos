import type { Metadata } from "next"
import { UsableProducerDesk } from "@/components/usable-producer-desk"

export const metadata: Metadata = { title: "Producer Desk" }
export default function ProducerPage() { return <UsableProducerDesk /> }
