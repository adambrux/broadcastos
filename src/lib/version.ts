import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.11",
  label: "BroadcastOS v2.11",
  name: "Liners only, everywhere",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
