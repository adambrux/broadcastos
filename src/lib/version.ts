import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.44",
  label: "BroadcastOS v2.44",
  name: "Say it like Adam",
  date: "23 November 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
