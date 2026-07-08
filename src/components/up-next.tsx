import { ArrowRight } from "lucide-react"

import type { ScheduleItem } from "@/lib/schedule-data"
import { cn } from "@/lib/utils"

export function UpNext({
  item,
  dark = false,
  compact = false,
}: {
  item: ScheduleItem | null
  dark?: boolean
  compact?: boolean
}) {
  if (!item) return null

  return (
    <div className={cn(
      "flex min-w-0 items-center gap-3",
      compact ? "sm:min-w-[240px]" : "rounded-2xl border bg-white/70 p-4",
      dark && !compact && "border-white/10 bg-white/[0.05]"
    )}>
      <span className={cn(
        "grid size-8 shrink-0 place-items-center rounded-xl",
        dark ? "bg-white/10 text-fuchsia-300" : "bg-brand-soft text-brand-indigo"
      )}>
        <ArrowRight className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className={cn(
          "text-[9px] font-semibold uppercase tracking-[0.15em]",
          dark ? "text-white/40" : "text-muted-foreground"
        )}>Up next · {item.startTime}</p>
        <p className="mt-0.5 truncate text-sm font-semibold">{item.showTitle}</p>
      </div>
    </div>
  )
}
