import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.41",
  label: "BroadcastOS v2.41",
  name: "Sam says",
  date: "23 November 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
