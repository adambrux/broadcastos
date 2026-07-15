import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.4",
  label: "BroadcastOS v2.4",
  name: "Paste-proof importing",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
