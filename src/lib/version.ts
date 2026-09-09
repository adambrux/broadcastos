import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.34",
  label: "BroadcastOS v2.34",
  name: "While you wait",
  date: "9 September 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
