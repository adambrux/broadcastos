import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.7",
  label: "BroadcastOS v2.7",
  name: "Presenter Hub repaired",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
