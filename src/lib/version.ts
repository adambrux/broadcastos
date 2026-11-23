import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.43",
  label: "BroadcastOS v2.43",
  name: "No trace",
  date: "23 November 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
