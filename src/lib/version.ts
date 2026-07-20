import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.13",
  label: "BroadcastOS v2.13",
  name: "Pastoral care",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
