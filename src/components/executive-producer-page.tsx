"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  Clock3,
  Headphones,
  ListChecks,
  Newspaper,
  Radio,
  Target,
  UsersRound,
} from "lucide-react"

import { ExecutiveProducerPanel } from "@/components/executive-producer-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  executiveBriefing,
  executiveContentPriorities,
  executiveListenerPriorities,
  executiveMissingItems,
  executiveRisks,
  executiveShowReadiness,
  executiveStationPriorities,
  executiveStoryPriorities,
  executiveTomorrowPrep,
  type ExecutivePriority,
} from "@/lib/executive-producer-data"
import { cn } from "@/lib/utils"

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function PriorityStatus({ status }: { status: ExecutivePriority["status"] }) {
  const style = status === "Ready"
    ? "bg-success-soft text-success"
    : status === "Future AI"
      ? "bg-fuchsia-50 text-fuchsia-700"
      : status === "Not connected"
        ? "bg-slate-100 text-slate-700"
        : status === "Action needed"
          ? "bg-amber-50 text-amber-700"
          : "bg-brand-soft text-brand-indigo"
  return <Badge className={style}>{status}</Badge>
}

export function ExecutiveProducerPage({ initialNow }: { initialNow: string }) {
  const now = useMemo(() => new Date(initialNow), [initialNow])
  const greeting = greetingForHour(now.getHours())
  const [resolved, setResolved] = useState<string[]>([])

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now)

  function toggleResolved(id: string) {
    setResolved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[30px] bg-[#10111a] text-white shadow-card">
        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-brand-magenta/10 blur-3xl" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2"><Badge className="border-white/10 bg-white/10 text-white"><BriefcaseBusiness />Daily command layer</Badge><span className="text-xs text-white/45">{dateLabel}</span></div>
              <h1 className="mt-5 text-[40px] font-semibold tracking-[-0.055em] sm:text-[56px]">Executive Producer</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">{greeting}, Adam. Here is the practical production picture across your shows, station obligations, audience, stories and reusable content.</p>
            </div>
            <div className="flex flex-wrap gap-2"><Button asChild className="h-11 rounded-xl bg-white text-ink hover:bg-white/90"><Link href="/producer"><ListChecks />Prepare today’s show</Link></Button><Button asChild variant="outline" className="h-11 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Link href="/broadcast"><Headphones />Open On Air</Link></Button></div>
          </div>
        </div>
        <div className="grid border-t border-white/10 bg-white/[0.035] sm:grid-cols-4">
          {[
            ["Current focus", executiveBriefing.currentFocus],
            ["Next show", executiveBriefing.nextShowTime],
            ["Readiness", `${executiveBriefing.readiness}%`],
            ["Prep remaining", executiveBriefing.prepRemaining],
          ].map(([label, value], index) => <div key={label} className={cn("px-6 py-4 sm:px-7", index > 0 && "border-t border-white/10 sm:border-l sm:border-t-0")}><p className="text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>)}
        </div>
      </header>

      <div>
        <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">1 · Senior producer view</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Today’s Briefing</h2></div>
        <ExecutiveProducerPanel greeting={greeting} showFullLink={false} />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="rounded-[26px] shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between px-6 pb-3 pt-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-magenta">2 · Needs action</p><CardTitle className="mt-1 text-2xl tracking-[-0.04em]">Missing Items</CardTitle></div><Badge variant="outline">{executiveMissingItems.length - resolved.length} open</Badge></CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="divide-y">
              {executiveMissingItems.map((item) => {
                const done = resolved.includes(item.id)
                return <button key={item.id} type="button" aria-pressed={done} onClick={() => toggleResolved(item.id)} className="flex w-full items-start gap-3 py-4 text-left"><span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border", done && "border-success bg-success text-white")}>{done && <Check className="size-3" />}</span><span className="min-w-0 flex-1"><span className={cn("block text-sm font-semibold", done && "text-muted-foreground line-through")}>{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.detail}</span></span><PriorityStatus status={done ? "Ready" : item.status} /></button>
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[26px] shadow-sm">
          <CardHeader className="px-6 pb-3 pt-6"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">4 · Across your week</p><CardTitle className="mt-1 text-2xl tracking-[-0.04em]">Show Readiness</CardTitle></CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            {executiveShowReadiness.map((show) => <article key={show.show} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{show.show}</h3><p className="mt-1 text-xs text-muted-foreground">{show.time}</p></div><strong className="font-mono text-lg text-brand-indigo">{show.readiness}%</strong></div><Progress value={show.readiness} className="mt-3 h-1.5" /><div className="mt-3 flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{show.state}</span><span className="text-right font-medium">{show.next}</span></div></article>)}
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <PriorityPanel number="5" title="Station Priorities" eyebrow="Premier Gospel" icon={Radio} items={executiveStationPriorities} />
        <PriorityPanel number="6" title="Listener Priorities" eyebrow="People and pastoral care" icon={UsersRound} items={executiveListenerPriorities} />
        <PriorityPanel number="7" title="Story Priorities" eyebrow="Editorial decisions" icon={Newspaper} items={executiveStoryPriorities} />
        <PriorityPanel number="8" title="Content Priorities" eyebrow="Scripts and feature objects" icon={BookOpenCheck} items={executiveContentPriorities} />
      </div>

      <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-magenta">9 · Look ahead</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">This Week’s Production Risks</h2><p className="mt-1 text-sm text-muted-foreground">Risks are mock editorial prompts, not automated monitoring.</p></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {executiveRisks.map((risk) => <article key={risk.title} className="rounded-2xl border p-5"><div className="flex items-start justify-between gap-2"><span className={cn("grid size-10 place-items-center rounded-xl", risk.severity === "High" ? "bg-red-50 text-destructive" : "bg-amber-50 text-amber-700")}><AlertTriangle className="size-[18px]" /></span><Badge variant="outline">{risk.severity}</Badge></div><h3 className="mt-5 text-sm font-semibold">{risk.title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{risk.detail}</p><div className="mt-4 rounded-xl bg-muted/50 p-3"><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Mitigation</p><p className="mt-1 text-xs leading-5">{risk.mitigation}</p></div></article>)}
        </div>
      </section>

      <section className="rounded-[28px] bg-ink p-5 text-white shadow-card sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-magenta">10 · One day ahead</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Tomorrow Prep</h2><p className="mt-1 text-sm text-white/50">Small decisions now that protect the next production day.</p></div><Badge className="w-fit bg-white/10 text-white"><CalendarClock />Manual plan</Badge></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {executiveTomorrowPrep.map((item) => <Link key={item.title} href={item.href} className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:bg-white/10"><div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white/10"><Clock3 className="size-4" /></span><ArrowRight className="size-4 text-white/40 transition-transform group-hover:translate-x-1" /></div><h3 className="mt-4 text-sm font-semibold">{item.title}</h3><p className="mt-2 text-xs leading-5 text-white/45">{item.detail}</p></Link>)}
        </div>
        <div className="mt-6 flex flex-wrap gap-2"><Badge className="bg-white/10 text-white">Mock data</Badge><Badge className="bg-fuchsia-400/15 text-fuchsia-200">Future AI generation</Badge><Badge className="bg-amber-400/15 text-amber-200">Live fetching not connected</Badge></div>
      </section>
    </div>
  )
}

function PriorityPanel({ number, title, eyebrow, icon: Icon, items }: { number: string; title: string; eyebrow: string; icon: typeof Radio; items: readonly ExecutivePriority[] }) {
  return (
    <Card className="rounded-[26px] shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between px-6 pb-3 pt-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">{number} · {eyebrow}</p><CardTitle className="mt-1 text-2xl tracking-[-0.04em]">{title}</CardTitle></div><span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Icon className="size-[18px]" /></span></CardHeader>
      <CardContent className="px-6 pb-6"><div className="divide-y">{items.map((item) => <Link key={item.id} href={item.href} className="group flex items-start gap-3 py-4"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"><Target className="size-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.detail}</span></span><span className="flex shrink-0 flex-col items-end gap-2"><PriorityStatus status={item.status} /><ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" /></span></Link>)}</div></CardContent>
    </Card>
  )
}
