import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.42",
  label: "BroadcastOS v2.42",
  name: "Producer paste",
  date: "23 November 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
