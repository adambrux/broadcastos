import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.9",
  label: "BroadcastOS v2.9",
  name: "Reading view refined",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
