import { Radio } from "lucide-react"

import { cn } from "@/lib/utils"

export function StudioAmbient() {
  return (
    <div className="studio-ambient" aria-hidden="true">
      <div className="studio-scanline" />
    </div>
  )
}

export function LiveStatusPill({
  label = "Live studio",
  dark = false,
  className,
}: {
  label?: string
  dark?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        dark ? "border-white/10 bg-white/10 text-white" : "border-red-200 bg-red-50 text-red-700",
        className
      )}
    >
      <span className="studio-live-dot" aria-hidden="true" />
      {label}
    </span>
  )
}

export function AudioLevelMeter({ dark = false, className }: { dark?: boolean; className?: string }) {
  const heights = ["42%", "78%", "54%", "92%", "62%", "84%"]

  return (
    <div className={cn("flex h-8 items-end gap-1", className)} aria-hidden="true">
      {heights.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={cn("studio-meter-bar w-1.5 rounded-full", dark ? "bg-white/75" : "bg-brand-indigo/70")}
          style={{ height }}
        />
      ))}
    </div>
  )
}

export function StudioSignalStrip({
  dark = false,
  message = "BroadcastOS studio signal active",
}: {
  dark?: boolean
  message?: string
}) {
  return (
    <div
      className={cn(
        "studio-ticker flex items-center justify-between gap-3 overflow-hidden rounded-2xl border px-4 py-3",
        dark
          ? "border-white/10 bg-[linear-gradient(110deg,rgba(255,255,255,.07),rgba(237,27,152,.12),rgba(42,59,172,.13),rgba(255,255,255,.06))] text-white"
          : "border-brand-indigo/10 bg-[linear-gradient(110deg,#fff,#f0edff,#fff2fb,#fff)] text-foreground"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", dark ? "bg-white/10" : "bg-brand-soft text-brand-indigo")}>
          <Radio className="size-4" />
        </span>
        <p className={cn("truncate text-xs font-semibold", dark ? "text-white/75" : "text-muted-foreground")}>{message}</p>
      </div>
      <AudioLevelMeter dark={dark} />
    </div>
  )
}
