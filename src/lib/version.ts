import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.8",
  label: "BroadcastOS v2.8",
  name: "True read counts",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
