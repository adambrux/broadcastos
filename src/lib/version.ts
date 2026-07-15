import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.5",
  label: "BroadcastOS v2.5",
  name: "The commercial cut",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
