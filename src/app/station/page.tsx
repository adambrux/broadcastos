import type { Metadata } from "next"
import { StationLayerPage } from "@/components/station-layer-page"

export const metadata: Metadata = { title: "Station" }
export default function StationPage() { return <StationLayerPage /> }
