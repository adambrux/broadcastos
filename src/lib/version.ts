import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.38",
  label: "BroadcastOS v2.38",
  name: "What's playing",
  date: "30 October 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
