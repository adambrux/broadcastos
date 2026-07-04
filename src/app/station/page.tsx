import type { Metadata } from "next"
import { WorkspacePage } from "@/components/workspace-page"

export const metadata: Metadata = { title: "Station" }
export default function StationPage() { return <WorkspacePage route="station" /> }
