import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.46",
  label: "BroadcastOS v2.46",
  name: "Any messages?",
  date: "23 November 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
