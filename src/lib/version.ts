import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.40",
  label: "BroadcastOS v2.40",
  name: "In the pocket",
  date: "23 November 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
