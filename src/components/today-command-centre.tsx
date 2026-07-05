"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlertCircle,
  BellRing,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Clock3,
  Headphones,
  Heart,
  Lightbulb,
  MessageCircleMore,
  Mic2,
  Music2,
  Newspaper,
  PartyPopper,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  todayAudienceSignals,
  todayChecklist,
  todayNotifications,
  todayShowCards,
  todayStationReminders,
  todayStories,
} from "@/lib/today-data"
import { cn } from "@/lib/utils"

const audienceIcons = {
  birthday: PartyPopper,
  anniversary: Heart,
  new: UsersRound,
  prayer: Sparkles,
  testimony: MessageCircleMore,
  song: Music2,
  congregation: Radio,
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function readinessTone(value: number) {
  if (value >= 90) return "text-success"
  if (value >= 70) return "text-brand-indigo"
  return "text-amber-700"
}

function ConnectionBadge({ label }: { label: string }) {
  const style = label === "Connected"
    ? "bg-success-soft text-success"
    : label === "Future AI"
      ? "bg-fuchsia-50 text-fuchsia-700"
      : label === "RSS/API needed"
        ? "bg-amber-50 text-amber-700"
        : "bg-muted text-muted-foreground"

  return <Badge className={style}>{label}</Badge>
}

type ChecklistState = { id: string; label: string; detail: string; complete: boolean }
type StoryState = {
  category: string
  title: string
  source: string
  status: string
  radioPotential: number
  christianPerspective: number
  question: string
  connection: string
}
type NotificationState = { id: string; title: string; detail: string; level: string }

export function TodayCommandCentre({ initialNow }: { initialNow: string }) {
  const now = useMemo(() => new Date(initialNow), [initialNow])
  const [checklist, setChecklist] = useState<ChecklistState[]>(todayChecklist.map((item) => ({ ...item })))
  const [stories, setStories] = useState<StoryState[]>(todayStories.map((story) => ({ ...story })))
  const [notifications, setNotifications] = useState<NotificationState[]>(todayNotifications.map((item) => ({ ...item })))

  const completed = checklist.filter((item) => item.complete).length
  const progress = Math.round((completed / checklist.length) * 100)
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now)

  function toggleChecklist(id: string) {
    setChecklist((current) => current.map((item) => item.id === id ? { ...item, complete: !item.complete } : item))
  }

  function chooseStory(category: string) {
    setStories((current) => current.map((story) => story.category === category ? { ...story, status: "Chosen" } : story))
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[30px] bg-[#10111a] text-white shadow-card">
        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <div className="absolute -right-28 -top-32 size-80 rounded-full bg-brand-magenta/10 blur-3xl" />
          <div className="absolute right-36 top-20 size-52 rounded-full bg-brand-indigo/20 blur-3xl" />
          <div className="relative flex flex-col gap-9 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-white/10 bg-white/10 text-white"><Sparkles />Executive Producer desk</Badge>
                <span className="text-xs text-white/45">{dateLabel}</span>
              </div>
              <h1 className="mt-5 text-[42px] font-semibold tracking-[-0.055em] sm:text-[58px]">{greetingForHour(now.getHours())}, Adam.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">Afternoons with Adam is today’s focus. The shape is strong; five production decisions remain before you go live.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="h-12 rounded-xl bg-white px-5 text-[#11131d] hover:bg-white/90">
                <Link href="/broadcast"><Headphones />Open Broadcast Mode</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-xl border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/producer"><Mic2 />Open Producer Desk</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="grid border-t border-white/10 bg-white/[0.035] sm:grid-cols-3">
          <div className="px-6 py-5 sm:px-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">Current focus</p>
            <p className="mt-2 font-semibold">Afternoons with Adam</p>
            <p className="mt-1 text-xs text-white/45">78% ready · Weekdays 1–4pm</p>
          </div>
          <div className="border-t border-white/10 px-6 py-5 sm:border-l sm:border-t-0 sm:px-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">Next on air</p>
            <p className="mt-2 font-semibold">Afternoons with Adam</p>
            <p className="mt-1 text-xs text-white/45">Today · 13:00 on Premier Gospel</p>
          </div>
          <div className="border-t border-white/10 px-6 py-5 sm:border-l sm:border-t-0 sm:px-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">Countdown</p>
            <p className="mt-1 font-mono text-3xl font-semibold tracking-[-0.05em]">02:18:42</p>
            <p className="mt-1 text-xs text-white/45">Mock countdown · Manual for now</p>
          </div>
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="overflow-hidden rounded-[26px] border-brand-indigo/10 bg-gradient-to-br from-white via-white to-brand-soft/55 shadow-card">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo"><Sparkles className="size-3.5" />Executive Producer</div>
                <p className="mt-5 text-xl font-medium leading-8 tracking-[-0.025em] sm:text-2xl sm:leading-9">
                  Good {now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"} Adam. I’ve processed this week’s Premier Gospel briefing. Afternoons with Adam is 78% ready. I found three potential Good News stories, one listener birthday, and two station reminders that still need placing.
                </p>
              </div>
              <Badge className="w-fit bg-brand-soft text-brand-indigo"><ShieldCheck />High confidence</Badge>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Prep remaining", "42 min", "Across five decisions"],
                ["Confidence score", "86%", "Based on today’s mock data"],
                ["Show readiness", "78%", "Strong shape, copy missing"],
                ["Suggested next", "Choose story", "Good News Around the World"],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">{label}</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[26px] bg-ink text-white shadow-card">
          <CardContent className="flex h-full flex-col justify-between p-6 sm:p-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">My recommendation</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">Choose the lead story next.</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">It unlocks the Hour 1 tease, audience question and producer wording in one move.</p>
            </div>
            <Button asChild className="mt-8 h-11 w-full rounded-xl bg-white text-ink hover:bg-white/90">
              <Link href="#today-stories"><Newspaper />Review story shortlist</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <Card className="rounded-[26px] shadow-sm">
          <CardHeader className="px-6 pb-3 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Today’s build</p><CardTitle className="mt-1 text-2xl tracking-[-0.04em]">Checklist</CardTitle></div>
              <span className="font-mono text-sm text-muted-foreground">{completed}/{checklist.length}</span>
            </div>
            <Progress value={progress} className="mt-4 h-1.5" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="divide-y">
              {checklist.map((item) => (
                <button key={item.id} type="button" aria-pressed={item.complete} onClick={() => toggleChecklist(item.id)} className="flex w-full items-center gap-3 py-3 text-left">
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border transition-colors", item.complete ? "border-success bg-success text-white" : "bg-white")}>{item.complete && <Check className="size-3" />}</span>
                  <span className="min-w-0 flex-1"><span className={cn("block text-sm font-medium", item.complete && "text-muted-foreground line-through")}>{item.label}</span><span className="block text-xs text-muted-foreground">{item.detail}</span></span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <section aria-labelledby="today-shows">
          <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Across your week</p><h2 id="today-shows" className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Today’s shows</h2></div><Link href="/shows" className="text-xs font-semibold text-brand-indigo">All shows →</Link></div>
          <div className="grid gap-4 lg:grid-cols-3">
            {todayShowCards.map((show) => (
              <Card key={show.slug} className="rounded-[24px] shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-2"><Badge variant="outline">{show.state}</Badge><span className={cn("font-mono text-lg font-semibold", readinessTone(show.readiness))}>{show.readiness}%</span></div>
                  <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{show.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{show.time}</p>
                  <div className="mt-5 space-y-2 border-t pt-4 text-xs">
                    <p><span className="text-muted-foreground">Presenter</span><span className="float-right font-medium">{show.presenter}</span></p>
                    <p><span className="text-muted-foreground">Producer</span><span className="float-right font-medium">{show.producer}</span></p>
                  </div>
                  <div className="mt-5 rounded-xl bg-muted/50 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Next action</p><p className="mt-1 text-xs font-medium leading-5">{show.nextAction}</p></div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm" className="rounded-xl"><Link href="/producer">Producer Desk</Link></Button>
                    <Button asChild size="sm" className="primary-action rounded-xl text-white"><Link href="/broadcast">On Air</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </section>

      <section id="today-stories" className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Editorial radar</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Today’s stories</h2><p className="mt-1 text-sm text-muted-foreground">Curated mock examples only. Live fetching is not connected yet.</p></div>
          <div className="flex flex-wrap gap-2"><ConnectionBadge label="Manual for now" /><ConnectionBadge label="Future AI" /><ConnectionBadge label="RSS/API needed" /></div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {stories.map((story) => (
            <article key={story.category} className={cn("flex min-h-[300px] flex-col rounded-2xl border p-4", story.status === "Chosen" && "border-brand-indigo/25 bg-brand-soft/35", story.status === "Missing" && "border-dashed bg-muted/20")}>
              <div className="flex items-start justify-between gap-2"><span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Newspaper className="size-4" /></span><Badge className={story.status === "Chosen" ? "bg-success-soft text-success" : story.status === "Missing" ? "bg-amber-50 text-amber-700" : "bg-brand-soft text-brand-indigo"}>{story.status}</Badge></div>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-indigo">{story.category}</p>
              <h3 className="mt-2 text-sm font-semibold leading-5">{story.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground">{story.source}</p>
              <div className="mt-5 space-y-2 text-xs">
                <p className="flex justify-between"><span className="text-muted-foreground">Radio potential</span><strong>{story.radioPotential || "—"}</strong></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Christian lens</span><strong>{story.christianPerspective || "—"}</strong></p>
                <p className="flex items-start gap-1.5 pt-1 text-muted-foreground">{story.question ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" /> : <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />}{story.question || "Listener question missing"}</p>
              </div>
              <div className="mt-auto pt-5">
                <ConnectionBadge label={story.connection} />
                {story.status !== "Chosen" && story.status !== "Missing" && <Button variant="ghost" size="sm" className="mt-2 w-full rounded-xl" onClick={() => chooseStory(story.category)}>Choose story</Button>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="rounded-[26px] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-3 pt-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">People before numbers</p><CardTitle className="mt-1 text-2xl tracking-[-0.04em]">Today’s audience</CardTitle></div><Button asChild variant="outline" size="sm"><Link href="/listeners">Open Audience</Link></Button></CardHeader>
          <CardContent className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
            {todayAudienceSignals.map((item) => {
              const Icon = audienceIcons[item.kind]
              return <article key={item.label} className="flex items-center gap-3 rounded-2xl border p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Icon className="size-[18px]" /></span><div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">{item.label}</p><div className="mt-0.5 flex items-baseline gap-2"><strong className="text-lg">{item.value}</strong><span className="truncate text-xs">{item.detail}</span></div></div></article>
            })}
          </CardContent>
        </Card>

        <Card className="rounded-[26px] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between px-6 pb-3 pt-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Premier Gospel</p><CardTitle className="mt-1 text-2xl tracking-[-0.04em]">Station reminders</CardTitle></div><Button asChild variant="outline" size="sm"><Link href="/station">Station HQ</Link></Button></CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="divide-y">
              {todayStationReminders.map((item) => (
                <div key={item.label} className="flex items-center gap-3 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-indigo"><Radio className="size-4" /></span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.label}</p><p className="truncate text-xs text-muted-foreground">{item.detail}</p></div>
                  <strong className="font-mono text-lg">{item.value}</strong>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-[26px] border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-magenta">Needs your attention</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Notifications</h2></div><Badge variant="outline">{notifications.length} open</Badge></div>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {notifications.map((notification) => (
            <article key={notification.id} className="flex items-start gap-3 rounded-2xl border p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pink-50 text-brand-magenta">{notification.level === "Suggestion" ? <Lightbulb className="size-4" /> : <BellRing className="size-4" />}</span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{notification.title}</h3><Badge variant="outline">{notification.level}</Badge></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{notification.detail}</p></div>
              <button type="button" aria-label={`Dismiss ${notification.title}`} onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </article>
          ))}
          {notifications.length === 0 && <div className="col-span-full rounded-2xl bg-success-soft py-10 text-center text-sm font-medium text-success"><CheckCircle2 className="mx-auto mb-2 size-5" />You’re clear for the next production decision.</div>}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><Clock3 className="size-3.5" />Today refreshes from mock BroadcastOS data.</span>
        <span className="flex items-center gap-2"><BookOpenCheck className="size-3.5" />AI, RSS, API and Notion connections are not active.</span>
      </footer>
    </div>
  )
}
