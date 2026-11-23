import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.45",
  label: "BroadcastOS v2.45",
  name: "She, he or they",
  date: "23 November 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
