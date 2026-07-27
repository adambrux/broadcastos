import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.18",
  label: "BroadcastOS v2.18",
  name: "Your words, your call",
  date: "25 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
