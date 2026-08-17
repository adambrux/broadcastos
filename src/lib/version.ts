import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.25",
  label: "BroadcastOS v2.25",
  name: "The studio keeps up",
  date: "17 August 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
