import type { Metadata } from "next"
import { WorkspacePage } from "@/components/workspace-page"

export const metadata: Metadata = { title: "Shows" }
export default function ShowsPage() { return <WorkspacePage route="shows" /> }
