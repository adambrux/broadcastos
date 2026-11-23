import type { Metadata } from "next"
import { AfterTheShowPage } from "@/components/after-the-show-page"

export const metadata: Metadata = { title: "After the show" }
export default function WrapPage() { return <AfterTheShowPage /> }
