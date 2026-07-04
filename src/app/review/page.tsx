import type { Metadata } from "next"
import { WorkspacePage } from "@/components/workspace-page"

export const metadata: Metadata = { title: "Review" }
export default function ReviewPage() { return <WorkspacePage route="review" /> }
