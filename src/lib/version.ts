import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.35",
  label: "BroadcastOS v2.35",
  name: "The breakfast chair",
  date: "11 September 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
