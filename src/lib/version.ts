import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.31",
  label: "BroadcastOS v2.31",
  name: "Lights down",
  date: "21 August 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
