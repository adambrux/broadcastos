"use client"

import Link from "next/link"
import { CalendarDays, Radio } from "lucide-react"

import { UpNext } from "@/components/up-next"
import {
  getScheduleState,
  getUkTimeLabel,
  scheduleConnectionLabel,
  scheduleSourceLabel,
} from "@/lib/schedule-data"
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
        "overflow-hidden rounded-[20px] border bg-white/90 shadow-sm",
        dark && "border-white/10 bg-white/[0.045] text-white shadow-none",
        className
      )}
    >
      <div className="flex flex-col gap-4 px-4 py-3.5 sm:px-5 lg:flex-row lg:items-center">
        <Link href="/schedule" className="flex min-w-0 flex-1 items-center gap-3 rounded-xl focus-visible:outline-offset-4">
          <span className={cn(
            "relative grid size-10 shrink-0 place-items-center rounded-2xl",
            dark ? "bg-white text-ink" : "bg-ink text-white"
          )}>
            <Radio className="size-[17px]" />
            <span className="studio-live-dot absolute right-0.5 top-0.5 border-2 border-white" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-[0.16em]",
                dark ? "text-red-300" : "text-red-600"
              )}>Now on air</span>
              <span className={cn("font-mono text-[10px]", dark ? "text-white/40" : "text-muted-foreground")}>
                {ready ? `${getUkTimeLabel(now)} UK` : "Checking UK time…"}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm font-semibold sm:text-base">
              {current?.showTitle ?? "Loading Premier Gospel schedule"}
            </p>
            {current && (
              <p className={cn("mt-0.5 truncate text-[10px]", dark ? "text-white/45" : "text-muted-foreground")}>
                {current.startTime}–{current.endTime}{current.presenter ? ` · ${current.presenter}` : ""}
              </p>
            )}
          </div>
        </Link>

        <UpNext item={next} dark={dark} compact />

        <div className={cn(
          "flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-[9px] lg:max-w-[290px] lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0",
          dark ? "border-white/10 text-white/35" : "border-border text-muted-foreground"
        )}>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3" />{scheduleSourceLabel}</span>
          <span>{scheduleConnectionLabel}</span>
        </div>
      </div>
    </section>
  )
}
