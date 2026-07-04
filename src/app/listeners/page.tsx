import type { Metadata } from "next"
import { ListenerHubPage } from "@/components/listener-hub-page"

export const metadata: Metadata = { title: "Listener Hub" }
export default function ListenersPage() { return <ListenerHubPage /> }
