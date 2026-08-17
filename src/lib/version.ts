import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.26",
  label: "BroadcastOS v2.26",
  name: "Studio glass",
  date: "17 August 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
