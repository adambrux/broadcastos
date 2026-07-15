import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.2",
  label: "BroadcastOS v2.2",
  name: "Response Gate fixes · click-through splash",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
