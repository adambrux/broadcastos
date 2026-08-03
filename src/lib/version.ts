import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.21",
  label: "BroadcastOS v2.21",
  name: "Your own keys",
  date: "3 August 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
