"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Activity,
  Airplay,
  ArrowRight,
  ArrowUpRight,
  AudioWaveform,
  AudioLines,
  Check,
  CheckCircle2,
  Clock3,
  FileAudio,
  FileText,
  ListFilter,
  Mic2,
  MoreHorizontal,
  Play,
  Plus,
  Radio,
  Search,
  Sparkles,
  Users,
  WandSparkles,
  X,
} from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { reviewTasks, schedule, shows, stationHealth } from "@/lib/mock-data"

type RouteName = "shows" | "producer" | "broadcast" | "listeners" | "station" | "review" | "settings"

const pageCopy: Record<RouteName, { eyebrow: string; title: string; description: string; action: string }> = {
  shows: { eyebrow: "Programming", title: "Shows", description: "Shape your station’s lineup and keep every episode moving.", action: "New show" },
  producer: { eyebrow: "Production desk", title: "Producer", description: "Build the rundown, cue the team, and keep today on time.", action: "New rundown" },
  broadcast: { eyebrow: "Live control", title: "Broadcast", description: "A calm, focused view of everything currently on air.", action: "Open studio" },
  listeners: { eyebrow: "Audience", title: "Listeners", description: "Understand who is listening and what keeps them tuned in.", action: "Create report" },
  station: { eyebrow: "Operations", title: "Station", description: "Monitor services, studios, automation, and stream health.", action: "Run check" },
  review: { eyebrow: "Quality", title: "Review", description: "Listen, approve, and keep every broadcast up to standard.", action: "Start review" },
  settings: { eyebrow: "Workspace", title: "Settings", description: "Control your station profile, defaults, and team preferences.", action: "Save changes" },
}

const statusStyles: Record<string, string> = {
  Live: "bg-brand-soft text-brand-indigo",
  Ready: "bg-success-soft text-success",
  Draft: "bg-muted text-muted-foreground",
}

const audienceWeek = [
  { day: "M", value: 38 },
  { day: "T", value: 56 },
  { day: "W", value: 47 },
  { day: "T", value: 64 },
  { day: "F", value: 72 },
  { day: "S", value: 68 },
  { day: "S", value: 88 },
] as const

function PageHeading({ route, onAction }: { route: RouteName; onAction: () => void }) {
  const copy = pageCopy[route]
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-brand-indigo">{copy.eyebrow}</p>
        <h1 className="text-[38px] font-semibold tracking-[-0.045em] sm:text-[48px]">{copy.title}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">{copy.description}</p>
      </div>
      <Button onClick={onAction} size="lg" className="primary-action h-11 rounded-xl px-5 text-white">
        {route === "settings" ? <Check /> : <Plus />}
        {copy.action}
      </Button>
    </header>
  )
}

function ShowsView() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_.75fr]">
      <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
        <CardHeader className="flex flex-row items-center justify-between px-6 pb-3 pt-5">
          <CardTitle>All shows</CardTitle>
          <Button variant="outline" size="sm"><ListFilter /> Filter</Button>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <div className="divide-y divide-border/70">
            {shows.map((show, index) => (
              <Link key={show.title} href={`/shows/${show.slug}`} className="group grid w-full gap-3 rounded-xl py-4 text-left transition-colors hover:bg-accent/60 sm:grid-cols-[44px_1fr_1fr_auto_auto] sm:items-center sm:px-2">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-indigo">{index % 2 ? <Radio className="size-5" /> : <Mic2 className="size-5" />}</span>
                <span><span className="block text-sm font-medium">{show.title}</span><span className="text-xs text-muted-foreground">{show.host}</span></span>
                <span className="text-xs text-muted-foreground">{show.time}<span className="mt-1 block">{show.audience} weekly listeners</span></span>
                <Badge className={statusStyles[show.status]}>{show.status}</Badge>
                <ArrowRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="soft-gradient rounded-[22px] border-brand-indigo/10 py-0 shadow-card">
        <CardContent className="flex min-h-[340px] flex-col justify-between p-6">
          <span className="grid size-11 place-items-center rounded-xl bg-white text-brand-indigo shadow-sm"><WandSparkles className="size-5" /></span>
          <div>
            <p className="text-xs font-medium text-brand-indigo">Programming insight</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Afternoons with Adam is building momentum.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Voice-note participation is up 18% across the last five weekday shows.</p>
            <Button variant="outline" className="mt-5 bg-white">View insight <ArrowUpRight /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProducerView() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_.75fr]">
      <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
        <CardHeader className="flex flex-row items-center justify-between px-6 pb-3 pt-5">
          <div><p className="text-xs text-brand-indigo">The Morning Edit</p><CardTitle className="mt-1">Today&apos;s rundown</CardTitle></div>
          <Badge className="bg-brand-soft text-brand-indigo">On air in 24 min</Badge>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <div className="divide-y divide-border/70">
            {schedule.map((item, index) => (
              <div key={item.show} className="grid grid-cols-[34px_72px_1fr_auto] items-center gap-3 py-4">
                <span className="grid size-7 place-items-center rounded-full bg-muted text-[11px] font-medium">{index + 1}</span>
                <span className="text-xs text-muted-foreground">{item.time.split("–")[0]}</span>
                <span><span className="block text-sm font-medium">{index === 0 ? "Opening & headlines" : item.show}</span><span className="text-xs text-muted-foreground">{index === 0 ? "News, weather and welcome" : item.producer}</span></span>
                <Button size="icon-sm" variant="ghost" aria-label={`More options for ${item.show}`}><MoreHorizontal /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-5">
        <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="px-5 pb-2 pt-5"><CardTitle>Studio readiness</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-5 pb-5">
            {["Host mic", "Phone hybrid", "Program output", "Stream link"].map((item) => (
              <div key={item} className="flex items-center gap-3"><CheckCircle2 className="size-4 text-success" /><span className="flex-1 text-sm">{item}</span><span className="text-xs text-muted-foreground">Ready</span></div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-[22px] bg-ink py-0 text-white ring-0">
          <CardContent className="p-5">
            <AudioLines className="size-6 text-brand-magenta" />
            <h3 className="mt-8 text-xl font-semibold">Soundcheck is open</h3>
            <p className="mt-2 text-sm text-white/60">Connect with Mara and test the studio return.</p>
            <Button className="mt-5 bg-white text-ink hover:bg-white/90">Join soundcheck</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BroadcastView() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-[24px] bg-ink py-0 text-white ring-0">
        <CardContent className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.5fr_auto] lg:items-center">
          <div><Badge className="bg-brand-magenta text-white">LIVE</Badge><h2 className="mt-4 text-3xl font-semibold">The Morning Edit</h2><p className="mt-1 text-sm text-white/60">with Mara Chen</p></div>
          <div>
            <p className="text-xs text-brand-magenta">Now playing</p><h3 className="mt-1 text-xl font-medium">City Hall Interview</h3><p className="mt-1 text-sm text-white/50">12:48 elapsed · 07:32 remaining</p>
            <AudioWaveform className="mt-5 h-12 w-48 text-brand-magenta" strokeWidth={1.25} aria-label="Live audio waveform" />
          </div>
          <Button size="icon-lg" className="size-14 rounded-full bg-white text-ink hover:bg-white/90" aria-label="Pause broadcast"><Play className="fill-current" /></Button>
        </CardContent>
      </Card>
      <div className="grid gap-5 md:grid-cols-3">
        {[["Live listeners", "2,418", Users], ["Next segment", "02:48", Clock3], ["Stream health", "Excellent", Activity]].map(([label, value, Icon]) => (
          <Card key={label as string} className="rounded-[22px] py-0 shadow-card ring-border/80"><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Icon className="size-5" /></span><span><span className="block text-xs text-muted-foreground">{label as string}</span><span className="mt-1 block text-xl font-semibold">{value as string}</span></span></CardContent></Card>
        ))}
      </div>
    </div>
  )
}

function ListenersView() {
  const segments = [["Returning", "47%", "+8.2%"], ["Mobile", "72%", "+3.4%"], ["Under 35", "38%", "+12.1%"]]
  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.8fr]">
      <Card className="soft-gradient rounded-[22px] border-brand-indigo/10 py-0 shadow-card">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">Weekly listeners</p><p className="mt-2 text-5xl font-semibold tracking-[-0.055em]">128.7K</p></div><Badge className="bg-success-soft text-success">↗ 12.4%</Badge></div>
          <div className="mt-10 h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={audienceWeek}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#77788a", fontSize: 10 }} />
                <Bar dataKey="value" fill="#6032a6" radius={[9, 9, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
        <CardHeader className="px-6 pb-2 pt-5"><CardTitle>Audience signals</CardTitle></CardHeader>
        <CardContent className="divide-y divide-border/70 px-6 pb-5">
          {segments.map(([label, value, delta]) => <div key={label} className="flex items-center py-4"><span className="flex-1 text-sm">{label}</span><span className="mr-4 text-lg font-semibold">{value}</span><span className="text-xs text-success">{delta}</span></div>)}
        </CardContent>
      </Card>
    </div>
  )
}

function StationView() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {stationHealth.map((item, index) => {
        const Icon = [Radio, Airplay, FileAudio, Users][index]
        return <Card key={item.label} className="rounded-[22px] py-0 shadow-card ring-border/80"><CardContent className="flex min-h-40 flex-col justify-between p-6"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Icon className="size-5" /></span><Badge className="bg-success-soft text-success">Healthy</Badge></div><div><p className="text-xl font-semibold">{item.label}</p><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p><p className="mt-3 text-sm font-medium">{item.value}</p></div></CardContent></Card>
      })}
    </div>
  )
}

function ReviewView() {
  return (
    <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
      <CardHeader className="flex flex-row items-center justify-between px-6 pb-3 pt-5"><CardTitle>Awaiting review</CardTitle><Tabs defaultValue="all"><TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="audio">Audio</TabsTrigger><TabsTrigger value="copy">Copy</TabsTrigger></TabsList></Tabs></CardHeader>
      <CardContent className="divide-y divide-border/70 px-6 pb-5">
        {reviewTasks.map((task) => <div key={task.title} className="flex items-center gap-4 py-4"><span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-indigo">{task.kind === "copy" ? <FileText className="size-5" /> : <FileAudio className="size-5" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{task.title}</span><span className="text-xs text-muted-foreground">{task.meta}</span></span><span className="hidden text-xs text-muted-foreground sm:block">{task.due}</span><Button variant="outline" size="sm">Review</Button></div>)}
      </CardContent>
    </Card>
  )
}

function SettingsView() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <Card className="rounded-[22px] py-0 shadow-card ring-border/80"><CardHeader className="px-6 pb-2 pt-5"><CardTitle>Station profile</CardTitle></CardHeader><CardContent className="space-y-5 px-6 pb-6"><label className="block space-y-2 text-sm font-medium">Station name<Input defaultValue="Premier Radio" className="h-11 rounded-xl" /></label><label className="block space-y-2 text-sm font-medium">Broadcast timezone<Input defaultValue="Europe/London (GMT+1)" className="h-11 rounded-xl" /></label><label className="block space-y-2 text-sm font-medium">Default studio<Input defaultValue="Studio A · London" className="h-11 rounded-xl" /></label></CardContent></Card>
      <Card className="rounded-[22px] py-0 shadow-card ring-border/80"><CardHeader className="px-6 pb-2 pt-5"><CardTitle>Production preferences</CardTitle></CardHeader><CardContent className="divide-y divide-border/70 px-6 pb-5">{[["Auto-save rundowns", true],["Require review before publish", true],["Show listener alerts", false],["Enable studio countdown", true]].map(([label, active]) => <label key={label as string} className="flex items-center gap-4 py-4 text-sm"><span className="flex-1">{label as string}</span><Switch defaultChecked={active as boolean} /></label>)}</CardContent></Card>
    </div>
  )
}

export function WorkspacePage({ route }: { route: RouteName }) {
  const [message, setMessage] = useState("")
  const renderView = () => {
    if (route === "shows") return <ShowsView />
    if (route === "producer") return <ProducerView />
    if (route === "broadcast") return <BroadcastView />
    if (route === "listeners") return <ListenersView />
    if (route === "station") return <StationView />
    if (route === "review") return <ReviewView />
    return <SettingsView />
  }

  return (
    <div>
      <PageHeading route={route} onAction={() => setMessage(`${pageCopy[route].action} is ready in this mock workspace.`)} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs defaultValue="overview"><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList></Tabs>
        {route !== "settings" && <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder={`Search ${route}…`} className="h-9 rounded-xl pl-9" /></div>}
      </div>
      {message && <div className="mb-5 flex items-center gap-2 rounded-xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success"><Sparkles className="size-4" />{message}<button className="ml-auto" onClick={() => setMessage("")} aria-label="Dismiss message"><X className="size-4" /></button></div>}
      {renderView()}
    </div>
  )
}
