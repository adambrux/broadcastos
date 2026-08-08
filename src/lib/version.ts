import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.24",
  label: "BroadcastOS v2.24",
  name: "The Extra Mile",
  date: "8 August 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
