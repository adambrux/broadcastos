import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.15",
  label: "BroadcastOS v2.15",
  name: "Made for live",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
