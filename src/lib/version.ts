import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.29",
  label: "BroadcastOS v2.29",
  name: "The podcast chair, tuned",
  date: "21 August 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
