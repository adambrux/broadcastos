"use client"

import Link from "next/link"
import { Radio } from "lucide-react"

import { UpNext } from "@/components/up-next"
import { getScheduleState, getUkTimeLabel } from "@/lib/schedule-data"
import { scheduleServerClock, useScheduleClock } from "@/lib/use-schedule-clock"
import { cn } from "@/lib/utils"

export function NowOnAirBanner({
  dark = false,
  className,
}: {
  dark?: boolean
  className?: string
}) {
  const clock = useScheduleClock()
  const ready = clock !== scheduleServerClock
  const now = new Date(clock)
  const { current, next } = ready
    ? getScheduleState(now)
    : { current: null, next: null }

  return (
    <section
      aria-label="Premier Gospel live schedule"
      className={cn(
        "overflow-hidden rounded-[20px] border bg-white/95 shadow-sm",
        dark && "border-white/10 bg-white/[0.045] text-white shadow-none",
        className
      )}
    >
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
        <Link href="/schedule" className="flex min-w-0 flex-1 items-center gap-3.5 rounded-xl focus-visible:outline-offset-4">
          <span className={cn(
            "relative grid size-12 shrink-0 place-items-center rounded-2xl",
            dark ? "bg-white text-ink" : "bg-ink text-white"
          )}>
            <Radio className="size-5" />
            <span className="studio-live-dot absolute right-0.5 top-0.5 border-2 border-white" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-[0.18em]",
                dark ? "text-red-300" : "text-red-600"
              )}>Now on air</span>
              <span className={cn("font-mono text-[11px]", dark ? "text-white/40" : "text-muted-foreground")}>
                {ready ? `${getUkTimeLabel(now)} UK` : ""}
              </span>
            </div>
            <p className="mt-0.5 truncate text-base font-semibold tracking-[-0.02em] sm:text-lg">
              {current?.showTitle ?? "Premier Gospel"}
            </p>
            {current && (
              <p className={cn("mt-0.5 truncate text-[11px]", dark ? "text-white/45" : "text-muted-foreground")}>
                {current.startTime}–{current.endTime}{current.presenter ? ` · ${current.presenter}` : ""}
              </p>
            )}
          </div>
        </Link>

        <UpNext item={next} dark={dark} compact />
      </div>
    </section>
  )
}
