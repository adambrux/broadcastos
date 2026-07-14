"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Clock3, Headphones, Radio, SlidersHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  formatCountdownSeconds,
  getAdamShowCountdownState,
} from "@/lib/adam-show-countdown"
import { cn } from "@/lib/utils"

export function ShowCountdownBanner({
  dark = false,
  compact = false,
  className,
}: {
  dark?: boolean
  compact?: boolean
  className?: string
}) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const state = useMemo(() => getAdamShowCountdownState(now), [now])
  const countdown = formatCountdownSeconds(state.seconds)
  const live = state.status === "live"

  return (
    <section
      aria-label="Adam show countdown"
      className={cn(
        "overflow-hidden rounded-[26px] border shadow-card",
        dark ? "border-white/10 bg-white/[0.055] text-white" : "border-brand-indigo/10 bg-gradient-to-br from-white via-brand-soft/35 to-white",
        compact && "rounded-[22px] shadow-sm",
        className
      )}
    >
      <div className={cn("grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center", !compact && "sm:p-6")}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn(live ? "bg-red-600 text-white" : "bg-ink text-white", dark && !live && "bg-white text-ink")}>
              {live ? <Radio /> : <Clock3 />}
              {live ? "Live now" : "Next Adam show"}
            </Badge>
            <Badge variant="outline" className={cn(dark && "border-white/15 bg-white/5 text-white")}>
              {state.show.role}
            </Badge>
            <span className={cn("text-xs font-medium", dark ? "text-white/45" : "text-muted-foreground")}>
              {state.dayLabel} · {state.startLabel}–{state.endLabel} UK
            </span>
          </div>

          <div className={cn("mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end", compact && "mt-3")}>
            <div className="min-w-0">
              <p className={cn("truncate font-semibold tracking-[-0.045em]", compact ? "text-2xl" : "text-3xl sm:text-4xl", dark && "text-white")}>
                {state.show.title}
              </p>
              <p className={cn("mt-2 text-sm leading-6", dark ? "text-white/55" : "text-muted-foreground")}>
                Presenter: {state.show.presenter} · Producer: {state.show.producer}
              </p>
            </div>

            <div className={cn("rounded-[22px] border px-5 py-4 text-left", dark ? "border-white/10 bg-black/20" : "border-brand-indigo/10 bg-white shadow-sm")}>
              <p className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", live ? "text-red-500" : "text-brand-indigo")}>
                {live ? "Time remaining" : "Starts in"}
              </p>
              <p className={cn("mt-1 font-mono font-black tracking-[-0.06em]", compact ? "text-3xl" : "text-4xl sm:text-5xl", dark && "text-white")}>
                {countdown}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col">
          <Button asChild className={cn("h-11 rounded-xl px-4", dark ? "bg-white text-ink hover:bg-white/90" : "primary-action text-white")}>
            <Link href="/broadcast"><Headphones />On Air</Link>
          </Button>
          <Button asChild variant="outline" className={cn("h-11 rounded-xl px-4", dark && "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white")}>
            <Link href="/producer"><SlidersHorizontal />Producer Desk</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
