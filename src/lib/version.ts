import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.20",
  label: "BroadcastOS v2.20",
  name: "Every word arrives",
  date: "29 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
