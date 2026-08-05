import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.23",
  label: "BroadcastOS v2.23",
  name: "Saves that shout",
  date: "5 August 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
