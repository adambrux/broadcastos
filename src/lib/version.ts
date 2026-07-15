import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.1",
  label: "BroadcastOS v2.1",
  name: "Script Format v2 · Response Gate",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
