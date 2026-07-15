"use client"

import Link from "next/link"
import { Clock3, ExternalLink, Radio, UserRound } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  formatScheduleDay,
  getScheduleState,
  premierGospelSchedule,
  scheduleDays,
  type ScheduleDay,
} from "@/lib/schedule-data"
import { scheduleServerClock, useScheduleClock } from "@/lib/use-schedule-clock"
import { cn } from "@/lib/utils"

function ScheduleList({ day, currentId }: { day: ScheduleDay; currentId?: string }) {
  return (
    <div className="space-y-2">
      {premierGospelSchedule[day].map((show) => {
        const isLive = show.id === currentId
        return (
          <article
            key={show.id}
            className={cn(
              "grid gap-3 rounded-[20px] border bg-white p-4 transition-colors sm:grid-cols-[105px_minmax(0,1fr)_auto] sm:items-center sm:p-5",
              isLive && "border-red-200 bg-red-50/45 ring-2 ring-red-100"
            )}
          >
            <div>
              <p className="font-mono text-sm font-semibold">{show.startTime}–{show.endTime}</p>
              {isLive && <Badge className="mt-2 bg-red-100 text-red-700"><span className="size-1.5 rounded-full bg-red-500" />Live now</Badge>}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-[-0.02em]">{show.showTitle}</h3>
              {show.presenter && <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-brand-indigo"><UserRound className="size-3" />{show.presenter}</p>}
              <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">{show.description}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="justify-self-start rounded-xl text-xs sm:justify-self-end">
              <Link href={show.sourceUrl} target="_blank" rel="noreferrer">Source <ExternalLink /></Link>
            </Button>
          </article>
        )
      })}
    </div>
  )
}

export function SchedulePage() {
  const clock = useScheduleClock()
  const scheduleState = clock === scheduleServerClock ? null : getScheduleState(new Date(clock))
  const [selectedDay, setSelectedDay] = useState<ScheduleDay | null>(null)
  const visibleDay = selectedDay ?? scheduleState?.ukDay ?? "monday"

  return (
    <div className="space-y-6">
      <header className="soft-gradient overflow-hidden rounded-[28px] border border-brand-indigo/10 p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-brand-soft text-brand-indigo"><Radio />Premier Gospel</Badge>
              <Badge variant="outline" className="bg-white/70">UK schedule</Badge>
            </div>
            <h1 className="mt-5 text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">Schedule</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              A clear weekly view of what is live, what follows and where Adam’s shows sit across Premier Gospel.
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="day" className="flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Broadcast week</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Premier Gospel on air</h2>
          </div>
          <TabsList className="rounded-xl">
            <TabsTrigger value="day">Full day</TabsTrigger>
            <TabsTrigger value="week">Full week</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="day" className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {scheduleDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "h-10 shrink-0 rounded-xl border bg-white px-4 text-xs font-semibold transition-colors",
                  visibleDay === day && "border-ink bg-ink text-white"
                )}
              >
                {formatScheduleDay(day)}
              </button>
            ))}
          </div>
          <Card className="rounded-[24px] py-0 shadow-card">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{premierGospelSchedule[visibleDay].length} programmes</p>
                  <h3 className="mt-1 text-xl font-semibold">{formatScheduleDay(visibleDay)}</h3>
                </div>
                {scheduleState?.ukDay === visibleDay && <Badge className="bg-success-soft text-success"><Clock3 />Today in the UK</Badge>}
              </div>
              <ScheduleList day={visibleDay} currentId={scheduleState?.current?.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <div className="grid gap-4 xl:grid-cols-2">
            {scheduleDays.map((day) => (
              <section key={day} className="rounded-[24px] border bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold tracking-[-0.03em]">{formatScheduleDay(day)}</h3>
                  <span className="font-mono text-[10px] text-muted-foreground">{premierGospelSchedule[day].length} shows</span>
                </div>
                <ScheduleList day={day} currentId={scheduleState?.current?.id} />
              </section>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
