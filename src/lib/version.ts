import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.12",
  label: "BroadcastOS v2.12",
  name: "The script sets the date",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
