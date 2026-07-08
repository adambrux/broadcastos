import Link from "next/link"
import {
  BookOpenCheck,
  CheckCircle2,
  CircleGauge,
  FileSearch,
  Headphones,
  Heart,
  ListChecks,
  MessageCircleMore,
  Mic2,
  Newspaper,
  Radio,
  ShieldCheck,
  Sparkles,
  UserRoundPlus,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { executiveActions, executiveBriefing, executiveReminders } from "@/lib/executive-producer-data"

const actionIcons = {
  prepare: ListChecks,
  "good-news": Sparkles,
  "christian-news": BookOpenCheck,
  listeners: UserRoundPlus,
  liner: Radio,
  producer: Mic2,
  "on-air": Headphones,
  review: CircleGauge,
} as const

const reminderIcons = [ListChecks, Radio, MessageCircleMore, FileSearch, Newspaper, Heart, Mic2] as const

export function ExecutiveProducerPanel({ greeting, showFullLink = true }: { greeting: string; showFullLink?: boolean }) {
  return (
    <section aria-labelledby="executive-producer-panel" className="overflow-hidden rounded-[28px] border border-brand-indigo/10 bg-gradient-to-br from-white via-white to-brand-soft/55 shadow-card">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-brand-soft text-brand-indigo"><Sparkles />Executive Producer</Badge>
              <Badge variant="outline" className="bg-white"><ShieldCheck />86% confidence</Badge>
              <Badge variant="outline" className="bg-white">Mock briefing</Badge>
            </div>
            <h2 id="executive-producer-panel" className="mt-5 text-2xl font-semibold leading-9 tracking-[-0.04em] sm:text-[30px]">
              {greeting}, Adam. {executiveBriefing.summary}
            </h2>
          </div>
          {showFullLink && (
            <Button asChild variant="outline" className="h-11 self-start rounded-xl bg-white">
              <Link href="/executive-producer">Open full briefing</Link>
            </Button>
          )}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Current focus", executiveBriefing.currentFocus, executiveBriefing.showState],
            ["Next show", executiveBriefing.nextShow, executiveBriefing.nextShowTime],
            ["Countdown", executiveBriefing.countdown, "Mock · Manual for now"],
            ["Prep remaining", executiveBriefing.prepRemaining, "Across five decisions"],
            ["Suggested next", executiveBriefing.suggestedAction, executiveBriefing.suggestedActionDetail],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-2xl border border-white bg-white/85 p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">{label}</p>
              <p className="mt-2 text-sm font-semibold leading-5">{value}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border bg-white/85 p-4">
          <div className="flex items-center justify-between gap-4 text-xs"><span className="font-semibold">Show readiness</span><strong className="font-mono text-brand-indigo">{executiveBriefing.readiness}%</strong></div>
          <Progress value={executiveBriefing.readiness} className="mt-3 h-1.5" />
        </div>

        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Cross-module reminders</p><span className="text-xs text-muted-foreground">Mock data · no background sync</span></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {executiveReminders.map((reminder, index) => {
              const Icon = reminderIcons[index]
              return (
                <div key={reminder.category} className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between gap-2"><span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-indigo"><Icon className="size-4" /></span><strong className="font-mono text-lg">{reminder.count}</strong></div>
                  <p className="mt-3 text-xs font-semibold">{reminder.category}</p>
                  <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{reminder.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t bg-[#11131d] p-5 text-white sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Suggested actions</p><p className="mt-1 text-sm text-white/70">The practical next moves across BroadcastOS.</p></div><CheckCircle2 className="size-5 text-brand-magenta" /></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {executiveActions.map((action) => {
            const Icon = actionIcons[action.kind]
            return (
              <Link key={action.label} href={action.href} className="group flex min-h-20 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:-translate-y-0.5 hover:bg-white/10">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10"><Icon className="size-4" /></span>
                <span className="min-w-0"><span className="block text-xs font-semibold">{action.label}</span><span className="mt-1 block text-[10px] leading-4 text-white/45">{action.detail}</span></span>
              </Link>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px]"><Badge className="bg-white/10 text-white">Manual for now</Badge><Badge className="bg-fuchsia-400/15 text-fuchsia-200">Future AI</Badge><Badge className="bg-amber-400/15 text-amber-200">Live fetching not connected</Badge></div>
      </div>
    </section>
  )
}
