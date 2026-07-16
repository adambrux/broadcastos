import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.10",
  label: "BroadcastOS v2.10",
  name: "Listener profiles",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
