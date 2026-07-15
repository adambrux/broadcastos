"use client"

import { useEffect, useState } from "react"
import { BarChart3, Loader2, Megaphone, MessageSquareText, Radio, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { studioShows, type StudioShowId } from "@/lib/studio-workspace"
import type { LinerArchiveItem } from "@/lib/presenter-hub"
import type { ListenerShowSummary, ListenerTotal } from "@/lib/listener-log"
import { cn } from "@/lib/utils"

type InsightsData = {
  totals: ListenerTotal[]
  shows: ListenerShowSummary[]
  allTime: { messages: number; listeners: number }
}

function showName(showId: string) {
  return studioShows[showId as StudioShowId]?.name ?? showId
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

export function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [liners, setLiners] = useState<LinerArchiveItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [listeners, hub] = await Promise.all([
          fetch("/api/listeners", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).catch(() => null),
          fetch("/api/presenter-hub", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).catch(() => null),
        ])
        if (listeners) {
          setData({
            totals: listeners.totals ?? [],
            shows: listeners.shows ?? [],
            allTime: listeners.allTime ?? { messages: 0, listeners: 0 },
          })
        }
        if (hub?.liners) setLiners(hub.liners as LinerArchiveItem[])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const topListeners = data?.totals.slice(0, 12) ?? []
  const recentShows = data?.shows.slice(0, 10) ?? []
  const linersByUse = [...liners].sort((a, b) => b.usageCount - a.usageCount).slice(0, 8)

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[30px] bg-ink p-6 text-white shadow-card sm:p-9">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-white/10 bg-white/10 text-white"><BarChart3 />Insights</Badge>
        </div>
        <h1 className="mt-5 text-[38px] font-semibold tracking-[-0.055em] sm:text-[52px]">Who&apos;s talking back</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
          Every name you log On Air lands here: message counts per show, all-time regulars worth a shout-out, and how often each station liner has been read.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Stat icon={MessageSquareText} label="Messages all time" value={data?.allTime.messages ?? 0} />
          <Stat icon={Users} label="Listeners heard from" value={data?.allTime.listeners ?? 0} />
          <Stat icon={Megaphone} label="Liner reads recorded" value={liners.reduce((sum, liner) => sum + liner.usageCount, 0)} />
        </div>
      </header>

      {loading ? (
        <div className="grid min-h-48 place-items-center rounded-[24px] border border-dashed text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Loading insights…</span>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <Card className="rounded-[28px] py-0 shadow-sm">
            <CardContent className="p-5 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Your regulars</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Names worth a shout-out</h2>
              <div className="mt-5 space-y-2">
                {topListeners.length ? topListeners.map((listener, index) => (
                  <div key={listener.name} className="flex items-center gap-3 rounded-2xl border bg-white p-3.5">
                    <span className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold",
                      index < 3 ? "bg-ink text-white" : "bg-muted text-muted-foreground"
                    )}>{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{listener.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {listener.showCount} show{listener.showCount === 1 ? "" : "s"} · last heard {formatDate(listener.lastHeard)}
                      </p>
                    </div>
                    <Badge className="bg-brand-soft text-brand-indigo">{listener.totalMessages} message{listener.totalMessages === 1 ? "" : "s"}</Badge>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                    <Users className="mx-auto mb-3 size-6" />
                    Log listener names On Air and your regulars will build up here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-[28px] py-0 shadow-sm">
              <CardContent className="p-5 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Show by show</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Messages per show</h2>
                <div className="mt-5 space-y-2">
                  {recentShows.length ? recentShows.map((show) => (
                    <div key={`${show.showId}-${show.showDate}`} className="flex items-center gap-3 rounded-2xl border bg-white p-3.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Radio className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{showName(show.showId)}</p>
                        <p className="text-[11px] text-muted-foreground">{formatDate(show.showDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-lg font-bold">{show.messages}</p>
                        <p className="text-[10px] text-muted-foreground">{show.names} name{show.names === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                      No shows logged yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] py-0 shadow-sm">
              <CardContent className="p-5 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Station liners</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Most read liners</h2>
                <div className="mt-5 space-y-2">
                  {linersByUse.length ? linersByUse.map((liner) => (
                    <div key={liner.id} className="flex items-center gap-3 rounded-2xl border bg-white p-3.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-fuchsia-50 text-fuchsia-700"><Megaphone className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{liner.title}</p>
                        <p className="text-[11px] text-muted-foreground">{liner.lastUsed ? `Last read ${formatDate(liner.lastUsed)}` : "Not read yet"}</p>
                      </div>
                      <Badge className="bg-fuchsia-50 text-fuchsia-700">{liner.usageCount} read{liner.usageCount === 1 ? "" : "s"}</Badge>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                      Liners appear here once a script has been imported.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
      <span className="grid size-9 place-items-center rounded-xl bg-white/10"><Icon className="size-4" /></span>
      <p className="mt-3 font-mono text-3xl font-black tracking-[-0.04em]">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-white/50">{label}</p>
    </div>
  )
}
