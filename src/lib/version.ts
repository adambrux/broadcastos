import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.6",
  label: "BroadcastOS v2.6",
  name: "Liners that save themselves",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
