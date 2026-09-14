import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.37",
  label: "BroadcastOS v2.37",
  name: "Straight away",
  date: "14 September 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
