"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, Check, Newspaper, Radio, SlidersHorizontal, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PastoralCarePanel } from "@/components/pastoral-care-panel"
import { ShowCountdownBanner } from "@/components/show-countdown-banner"
import { StudioAmbient } from "@/components/studio-motion"
import { studioShows, useStudioWorkspace } from "@/lib/studio-workspace"

export function StudioHome() {
  const workspace = useStudioWorkspace()
  const show = studioShows[workspace.showId]
  const readyItems = workspace.items.filter((item) => item.script || item.objective).length

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-[30px] bg-ink p-6 text-white shadow-card sm:p-9">
        <StudioAmbient />
        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-[42px] font-semibold tracking-[-0.055em] sm:text-[58px]">Build today&apos;s show. Then go on air.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">Your running order, scripts and listeners, all in one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="h-12 rounded-xl border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"><Link href="/producer"><SlidersHorizontal />Produce</Link></Button>
            <Button asChild className="h-12 rounded-xl bg-white px-6 text-ink hover:bg-white/90"><Link href="/broadcast"><Radio />Go On Air</Link></Button>
          </div>
        </div>
      </header>

      <ShowCountdownBanner compact />

      <PastoralCarePanel compact />

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="studio-card-lift rounded-[26px] py-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Today&apos;s show</p>
                <h2 className="mt-1 text-2xl font-semibold">{show.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{show.schedule}{workspace.date ? ` · ${workspace.date}` : ""}</p>
              </div>
              <Badge className={workspace.items.length ? "bg-success-soft text-success" : "bg-amber-50 text-amber-700"}>{workspace.items.length ? <Check /> : <TriangleAlert />}{workspace.items.length ? `${readyItems}/${workspace.items.length} links ready` : "Nothing loaded"}</Badge>
            </div>
            <div className="mt-6 space-y-2">
              {workspace.items.slice(0, 6).map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl border bg-white p-3.5 transition-colors hover:border-brand-indigo/20 hover:bg-brand-soft/20">
                  <span className="grid size-8 place-items-center rounded-xl bg-muted font-mono text-[10px]">{String(index + 1).padStart(2, "0")}</span>
                  {item.time && <span className="font-mono text-[10px] text-muted-foreground">{item.time}</span>}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.title}</span>
                </div>
              ))}
              {workspace.items.length > 6 && (
                <p className="px-1 text-xs text-muted-foreground">+ {workspace.items.length - 6} more links</p>
              )}
              {!workspace.items.length && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No show loaded yet. Import or build one in Produce.</div>}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 content-start">
          <Card className="studio-card-lift rounded-[24px] py-0 shadow-card">
            <CardContent className="p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Newspaper className="size-4" /></span>
              <h2 className="mt-4 text-lg font-semibold">Presenter Hub</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Weekly liners and saved briefs, with read counts kept automatically.</p>
              <Button asChild variant="outline" className="mt-4 w-full rounded-xl"><Link href="/newsroom">Open Presenter Hub <ArrowRight /></Link></Button>
            </CardContent>
          </Card>
          <Card className="studio-card-lift rounded-[24px] py-0 shadow-card">
            <CardContent className="p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><BarChart3 className="size-4" /></span>
              <h2 className="mt-4 text-lg font-semibold">Insights</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Who messaged in, show by show and all time, plus liner reads.</p>
              <Button asChild variant="outline" className="mt-4 w-full rounded-xl"><Link href="/insights">Open Insights <ArrowRight /></Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
