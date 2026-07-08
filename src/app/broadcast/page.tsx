import type { Metadata } from "next"
import { UsableOnAir } from "@/components/usable-on-air"

export const metadata: Metadata = { title: "On Air" }
export default function BroadcastPage() { return <UsableOnAir /> }
