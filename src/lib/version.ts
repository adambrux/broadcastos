import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.36",
  label: "BroadcastOS v2.36",
  name: "Saved regardless",
  date: "14 September 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
