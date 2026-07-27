import type { Metadata } from "next"

import { ScriptIssuesPage } from "@/components/script-issues-page"

export const metadata: Metadata = {
  title: "Script issues",
}

export default function Page() {
  return <ScriptIssuesPage />
}
