import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.32",
  label: "BroadcastOS v2.32",
  name: "One name, one total",
  date: "8 September 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
