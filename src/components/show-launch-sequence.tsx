"use client"

import { AlertTriangle, Check, MapPin, RotateCcw, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  duringShowSafetyReminder,
  launchLocationLabels,
  launchSequenceSteps,
  useLaunchSequence,
  type LaunchLocation,
} from "@/lib/launch-sequence"
import { studioShows, type StudioShowId } from "@/lib/studio-workspace"
import { cn } from "@/lib/utils"

const locations: LaunchLocation[] = ["live-london", "live-birmingham", "pre-recorded"]

function timeLabel(value?: string) {
  if (!value) return "Not checked"
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

function LaunchSequenceBody({
  showId,
  date,
  dark = false,
}: {
  showId: StudioShowId
  date: string
  dark?: boolean
}) {
  const sequence = useLaunchSequence(showId, date)
  const show = studioShows[showId]

  return (
    <div className={cn("space-y-5", dark && "text-white")}>
      <div className={cn("rounded-3xl border p-4", dark ? "border-white/10 bg-white/[0.04]" : "bg-brand-soft/30")}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn(sequence.complete ? "bg-success text-white" : "bg-red-600 text-white")}>
            {sequence.complete ? <ShieldCheck /> : <AlertTriangle />}
            {sequence.complete ? "Launch complete" : `${sequence.completedCount} of ${sequence.totalCount} complete`}
          </Badge>
          <Badge variant="outline" className={cn(dark && "border-white/15 bg-white/5 text-white")}>{show.name}</Badge>
          <Badge variant="outline" className={cn(dark && "border-white/15 bg-white/5 text-white")}>{date || "No date set"}</Badge>
        </div>
        <p className={cn("mt-3 text-sm leading-6", dark ? "text-white/65" : "text-muted-foreground")}>
          Never trust an inherited studio. Five minutes of checks protects three hours of live radio.
        </p>
      </div>

      <div>
        <p className={cn("text-[10px] font-semibold uppercase tracking-[0.15em]", dark ? "text-white/45" : "text-muted-foreground")}>Where is this show happening?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {locations.map((location) => (
            <button
              key={location}
              type="button"
              onClick={() => sequence.setLocation(location)}
              className={cn(
                "rounded-2xl border px-3 py-3 text-left text-xs font-semibold transition",
                sequence.state.location === location
                  ? dark ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100" : "border-success/20 bg-success-soft text-success"
                  : dark ? "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.07]" : "bg-white text-muted-foreground hover:border-brand-indigo/25"
              )}
            >
              <span className="inline-flex items-center gap-2"><MapPin className="size-3.5" />{launchLocationLabels[location]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {launchSequenceSteps.map((step, index) => {
          const completedAt = sequence.state.completedAtByStep[step.id]
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => sequence.toggleStep(step.id)}
              className={cn(
                "w-full rounded-3xl border p-4 text-left transition",
                completedAt
                  ? dark ? "border-emerald-300/25 bg-emerald-300/[0.09]" : "border-success/20 bg-success-soft"
                  : dark ? "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]" : "bg-white hover:border-brand-indigo/25 hover:shadow-sm"
              )}
            >
              <div className="flex gap-3">
                <span className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-2xl text-sm font-semibold",
                  completedAt ? "bg-success text-white" : dark ? "bg-white/10 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {completedAt ? <Check className="size-4" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{step.title}</span>
                    <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", completedAt ? "bg-white/70 text-success" : dark ? "bg-white/10 text-white/45" : "bg-muted text-muted-foreground")}>
                      {timeLabel(completedAt)}
                    </span>
                  </span>
                  <span className={cn("mt-2 block text-sm leading-6", dark ? "text-white/70" : "text-muted-foreground")}>{step.instruction}</span>
                  <span className={cn("mt-2 block text-xs leading-5", dark ? "text-white/40" : "text-muted-foreground")}>{step.why}</span>
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className={cn("rounded-3xl border p-4 text-sm font-semibold leading-6", dark ? "border-amber-300/20 bg-amber-300/[0.08] text-amber-100" : "border-amber-200 bg-amber-50 text-amber-900")}>
        {duringShowSafetyReminder}
      </div>

      <Button
        variant="outline"
        className={cn("w-full rounded-xl", dark && "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white")}
        onClick={sequence.reset}
      >
        <RotateCcw />Reset this show day
      </Button>
    </div>
  )
}

export function ShowLaunchSequencePanel({
  showId,
  date,
}: {
  showId: StudioShowId
  date: string
}) {
  const sequence = useLaunchSequence(showId, date)

  return (
    <Card className="studio-card-lift rounded-[24px] border-brand-indigo/10 bg-gradient-to-br from-white to-brand-soft/30 py-0 shadow-card">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={sequence.complete ? "bg-success text-white" : "bg-red-600 text-white"}>
                {sequence.complete ? <ShieldCheck /> : <AlertTriangle />}
                Launch sequence
              </Badge>
              <Badge variant="outline">{sequence.completedCount} of {sequence.totalCount}</Badge>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Pre-show launch check</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Run this before every show. Each show day starts fresh so the studio state is checked, not assumed.
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button className={cn("rounded-xl", sequence.complete ? "bg-success text-white hover:bg-success/90" : "bg-ink text-white hover:bg-ink/90")}>
                {sequence.complete ? <ShieldCheck /> : <AlertTriangle />}
                {sequence.complete ? "Review checks" : "Run launch sequence"}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
              <SheetHeader className="border-b p-5">
                <SheetTitle>BroadcastOS show launch sequence</SheetTitle>
                <SheetDescription>Confirm the studio is genuinely ready before going on air.</SheetDescription>
              </SheetHeader>
              <div className="p-5">
                <LaunchSequenceBody showId={showId} date={date} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  )
}

export function LaunchSequenceIndicator({
  showId,
  date,
  dark = false,
}: {
  showId: StudioShowId
  date: string
  dark?: boolean
}) {
  const sequence = useLaunchSequence(showId, date)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "fixed right-5 top-20 z-40 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur transition hover:scale-[1.02]",
            sequence.complete
              ? "border-emerald-300/30 bg-emerald-400/20 text-emerald-50"
              : "border-red-300/35 bg-red-600/85 text-white",
            !dark && (sequence.complete ? "text-success" : "text-white")
          )}
        >
          {sequence.complete ? <ShieldCheck className="size-4" /> : <AlertTriangle className="size-4" />}
          <span>{sequence.complete ? "Launch checked" : `Launch ${sequence.completedCount}/${sequence.totalCount}`}</span>
        </button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto border-white/10 bg-[#08090d] p-0 text-white sm:max-w-xl" showCloseButton>
        <SheetHeader className="border-b border-white/10 p-5">
          <SheetTitle className="text-white">BroadcastOS show launch sequence</SheetTitle>
          <SheetDescription className="text-white/45">This stays visible until the show day’s safety checks are complete.</SheetDescription>
        </SheetHeader>
        <div className="p-5">
          <LaunchSequenceBody showId={showId} date={date} dark />
        </div>
      </SheetContent>
    </Sheet>
  )
}
