import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.17",
  label: "BroadcastOS v2.17",
  name: "The monthly arcade",
  date: "25 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
