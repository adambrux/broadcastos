import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.28",
  label: "BroadcastOS v2.28",
  name: "The podcast chair",
  date: "21 August 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
