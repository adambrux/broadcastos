import type { Metadata } from "next"

import { CongregationPage } from "@/components/congregation-page"

export const metadata: Metadata = { title: "Sunday Show Congregation" }

export default function SundayShowCongregationPage() {
  return <CongregationPage />
}
