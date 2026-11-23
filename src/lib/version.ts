import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.39",
  label: "BroadcastOS v2.39",
  name: "Straight in",
  date: "23 November 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
