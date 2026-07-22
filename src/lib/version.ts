import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.16",
  label: "BroadcastOS v2.16",
  name: "Import knows the rules",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
