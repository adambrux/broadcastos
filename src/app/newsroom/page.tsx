import type { Metadata } from "next"

import { NewsroomPage } from "@/components/newsroom-page"

export const metadata: Metadata = { title: "Newsroom" }

export default function NewsroomRoute() {
  return <NewsroomPage />
}
