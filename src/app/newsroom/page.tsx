import type { Metadata } from "next"

import { NewsroomPage } from "@/components/newsroom-page"

export const metadata: Metadata = { title: "Presenter Hub" }

export default function NewsroomRoute() {
  return <NewsroomPage />
}
