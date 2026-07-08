import type { Metadata } from "next"

import { StudioHome } from "@/components/studio-home"

export const metadata: Metadata = { title: "Today" }

export default function TodayPage() {
  return <StudioHome />
}
