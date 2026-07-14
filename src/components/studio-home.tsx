"use client"

import Link from "next/link"
import { ArrowRight, Check, MessageSquareText, Newspaper, Radio, SlidersHorizontal, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NowOnAirBanner } from "@/components/now-on-air-banner"
import { StudioModeSwitch } from "@/components/studio-mode-switch"
import { AudioLevelMeter, LiveStatusPill, StudioAmbient, StudioSignalStrip } from "@/components/studio-motion"
import { studioShows, useStudioWorkspace } from "@/lib/studio-workspace"

export function StudioHome() {
  const workspace = useStudioWorkspace()
  const show = studioShows[workspace.showId]
  const readyItems = workspace.items.filter((item) => item.script || item.objective).length

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-[30px] bg-ink p-6 text-white shadow-card sm:p-9">
        <StudioAmbient />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-white/10 bg-white/10 text-white">BroadcastOS · usable studio mode</Badge>
            <LiveStatusPill dark label="Studio signal active" />
          </div>
        <div className="mt-8 flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-[42px] font-semibold tracking-[-0.055em] sm:text-[58px]">Build today’s show. Then go on air.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">One local workspace for your running order, scripts, CTAs, notes and pasted listener messages. No pretend connections.</p>
            <div className="mt-6 max-w-xl">
              <StudioSignalStrip dark message="Live workspace pulse · manual tools only · ready for broadcast" />
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 xl:items-end">
            <AudioLevelMeter dark className="h-10" />
            <Button asChild className="h-12 rounded-xl bg-white px-6 text-ink hover:bg-white/90"><Link href="/producer"><SlidersHorizontal />Open Producer Desk</Link></Button>
          </div>
        </div>
        </div>
      </header>

      <StudioModeSwitch />
      <NowOnAirBanner />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="studio-card-lift rounded-[24px] py-0 shadow-card">
          <CardContent className="p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><SlidersHorizontal className="size-4" /></span>
            <h2 className="mt-5 text-lg font-semibold">Producer Desk</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Start blank or load the correct show template, then fill today’s content.</p>
            <Button asChild variant="outline" className="mt-5 w-full rounded-xl"><Link href="/producer">Build show <ArrowRight /></Link></Button>
          </CardContent>
        </Card>
        <Card className="studio-card-lift rounded-[24px] py-0 shadow-card">
          <CardContent className="p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Newspaper className="size-4" /></span>
            <h2 className="mt-5 text-lg font-semibold">Presenter Hub</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Recall weekly liners, saved briefs, uploads and show script usage.</p>
            <Button asChild variant="outline" className="mt-5 w-full rounded-xl"><Link href="/newsroom">Open Presenter Hub <ArrowRight /></Link></Button>
          </CardContent>
        </Card>
        <Card className="studio-card-lift rounded-[24px] py-0 shadow-card">
          <CardContent className="p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-ink text-white"><Radio className="size-4" /></span>
            <h2 className="mt-5 text-lg font-semibold">On Air</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">See the current link, script, CTA, notes, messages and what comes next.</p>
            <Button asChild className="primary-action mt-5 w-full rounded-xl text-white"><Link href="/broadcast">Open On Air <ArrowRight /></Link></Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="studio-card-lift rounded-[26px] py-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Current local workspace</p><h2 className="mt-1 text-2xl font-semibold">{show.name}</h2><p className="mt-1 text-xs text-muted-foreground">{show.schedule} · {workspace.date || "No date set"}</p></div>
              <Badge className={workspace.items.length ? "bg-success-soft text-success" : "bg-amber-50 text-amber-700"}>{workspace.items.length ? <Check /> : <TriangleAlert />}{workspace.items.length ? `${readyItems}/${workspace.items.length} items started` : "Blank"}</Badge>
            </div>
            <div className="mt-6 space-y-2">
              {workspace.items.slice(0, 5).map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl border bg-white p-3.5 transition-colors hover:border-brand-indigo/20 hover:bg-brand-soft/20">
                  <span className="grid size-8 place-items-center rounded-xl bg-muted font-mono text-[10px]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{item.time || "—"}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.title}</span>
                </div>
              ))}
              {!workspace.items.length && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No running order yet. Start blank or load a template in Producer Desk.</div>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-success/15 bg-success-soft p-5 text-success">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Works now</p>
            <ul className="mt-3 space-y-2 text-sm"><li>• Local running order and templates</li><li>• Editable scripts, CTAs and notes</li><li>• Pasted listener messages</li><li>• Shared On Air view</li></ul>
          </div>
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Not connected</p>
            <ul className="mt-3 space-y-2 text-sm"><li>• Zetta song and playout data</li><li>• WhatsApp feed</li><li>• Live news fetching</li><li>• AI generation</li></ul>
          </div>
          <div className="flex items-center gap-3 rounded-[20px] border bg-white p-4 text-sm"><MessageSquareText className="size-4 text-brand-indigo" /><span>{workspace.mode === "remote" ? <><strong>{workspace.messages.length}</strong> pasted listener messages available On Air</> : <>Studio companion mode · listener messages remain on studio systems</>}</span></div>
        </div>
      </section>
    </div>
  )
}
