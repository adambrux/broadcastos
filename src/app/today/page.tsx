import type { Metadata } from "next"

import { TodayCommandCentre } from "@/components/today-command-centre"

export const metadata: Metadata = { title: "Today" }
export const dynamic = "force-dynamic"

export default function TodayPage() {
  return <TodayCommandCentre initialNow={new Date().toISOString()} />
}
