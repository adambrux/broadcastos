import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.33",
  label: "BroadcastOS v2.33",
  name: "Hold still",
  date: "9 September 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
