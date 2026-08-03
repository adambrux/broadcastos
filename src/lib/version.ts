import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.22",
  label: "BroadcastOS v2.22",
  name: "Your show, your rules",
  date: "3 August 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
