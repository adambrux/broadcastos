import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.30",
  label: "BroadcastOS v2.30",
  name: "Back to back",
  date: "21 August 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
