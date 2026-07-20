import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.14",
  label: "BroadcastOS v2.14",
  name: "Family memory",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
