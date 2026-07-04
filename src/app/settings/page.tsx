import type { Metadata } from "next"
import { WorkspacePage } from "@/components/workspace-page"

export const metadata: Metadata = { title: "Settings" }
export default function SettingsPage() { return <WorkspacePage route="settings" /> }
