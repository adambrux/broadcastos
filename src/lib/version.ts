import { buildInfo } from "@/generated/build-info"

export const broadcastOSVersion = {
  code: "2.3",
  label: "BroadcastOS v2.3",
  name: "Promo import from docx · calmer import warnings",
  date: "15 July 2026",
  build: buildInfo.shortCommit,
  builtAt: buildInfo.builtAt,
} as const
