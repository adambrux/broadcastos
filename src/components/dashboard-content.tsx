"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpenCheck,
  ChevronDown,
  ClipboardCheck,
  FileAudio,
  FileSearch,
  FileText,
  Headphones,
  MessageSquareText,
  Mic2,
  MoreHorizontal,
  NotebookPen,
  Radio,
  Sparkles,
  UserRoundPlus,
  Users,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  dashboardData,
  listenerData,
  reviewTasks,
  schedule,
  showProfiles,
  stationHealth,
} from "@/lib/mock-data"

const quickActionIcons = {
  build: NotebookPen,
  broadcast: Radio,
  brief: FileSearch,
  listener: UserRoundPlus,
  review: ClipboardCheck,
} as const

const nextShowActionIcons = {
  rundown: FileText,
  headphones: Headphones,
  messages: MessageSquareText,
  profile: BookOpenCheck,
} as const

const stationHealthIcons = {
  stream: Radio,
  automation: AudioLines,
  assets: FileAudio,
  listeners: Users,
} as const

function SectionAction({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-[12px] font-medium text-foreground transition-colors hover:text-brand-indigo">
      {children}
      <ArrowRight className="size-3.5" />
    </Link>
  )
}

export function DashboardContent() {
  const [range, setRange] = useState("This week")
  const nextShow = showProfiles[dashboardData.nextShowSlug]

  return (
    <div className="space-y-5">
      <header className="pt-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-brand-indigo">{dashboardData.eyebrow}</p>
          <h1 className="text-balance text-[34px] font-semibold tracking-[-0.04em] sm:text-[46px]">{dashboardData.greeting}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{dashboardData.introduction}</p>
        </div>
      </header>

      <section aria-labelledby="quick-actions-title" className="rounded-[22px] border border-border/70 bg-white p-3 shadow-card">
        <div className="flex items-center justify-between px-2 pb-3 pt-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Production shortcuts</p>
            <h2 id="quick-actions-title" className="mt-1 text-sm font-semibold">Move the next show forward</h2>
          </div>
          <Sparkles className="size-4 text-brand-magenta" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {dashboardData.quickActions.map((action, index) => {
            const Icon = quickActionIcons[action.kind]
            return (
              <Link
                key={action.label}
                href={action.href}
                className={index === 0
                  ? "group flex min-h-16 items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                  : "group flex min-h-16 items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-brand-soft hover:text-brand-indigo"}
              >
                <span className={index === 0 ? "grid size-9 shrink-0 place-items-center rounded-xl bg-white/10" : "grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand-indigo shadow-sm"}>
                  <Icon className="size-4" strokeWidth={1.8} />
                </span>
                <span className="leading-5">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="soft-gradient flex flex-col gap-5 rounded-[22px] border border-brand-indigo/10 px-5 py-5 shadow-[0_10px_40px_rgba(28,33,61,.04)] lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-indigo">
            <Mic2 className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-indigo">{dashboardData.nextShowLabel}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">{nextShow.title}</h2>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{dashboardData.nextShowCountdown}</span>
              <Badge variant="secondary" className="bg-brand-soft text-brand-indigo">{dashboardData.nextShowStatus}</Badge>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {dashboardData.nextShowActions.map((action) => {
            const Icon = nextShowActionIcons[action.kind]
            return (
              <Link key={action.label} href={action.href} className="flex min-w-[118px] flex-col items-center gap-2 rounded-xl px-3 py-3 text-center text-xs font-medium transition-colors hover:bg-white/80">
                <Icon className="size-5" strokeWidth={1.8} />
                {action.label}
              </Link>
            )
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Card className="rounded-[22px] border-0 bg-card py-0 shadow-card ring-1 ring-border/80">
          <CardHeader className="flex flex-row items-start justify-between px-5 pb-0 pt-5 sm:px-6">
            <div>
              <CardTitle className="text-base">{dashboardData.listenerSummary.label}</CardTitle>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-[32px] font-semibold tracking-[-0.04em]">{dashboardData.listenerSummary.value}</span>
                <Badge className="mb-1 bg-success-soft text-success hover:bg-success-soft"><ArrowUpRight /> {dashboardData.listenerSummary.change}</Badge>
                <span className="mb-1.5 hidden text-[11px] text-muted-foreground sm:inline">{dashboardData.listenerSummary.comparison}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">{range}<ChevronDown /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["This week", "Last 30 days", "This quarter"].map((item) => (
                  <DropdownMenuItem key={item} onClick={() => setRange(item)}>{item}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="px-2 pb-3 pt-1 sm:px-4">
            <div className="h-[205px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={listenerData} margin={{ top: 16, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="listenerFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6032a6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#6032a6" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#eceaf2" strokeDasharray="3 5" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#77788a", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#77788a", fontSize: 10 }} domain={[0, 160]} ticks={[0, 50, 100, 150]} />
                  <ChartTooltip cursor={{ stroke: "#c9c5de", strokeDasharray: "3 3" }} contentStyle={{ borderRadius: 12, border: "1px solid #e8e5ee", boxShadow: "0 10px 30px rgba(25,24,45,.08)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="listeners" stroke="#2a3bac" strokeWidth={2.2} fill="url(#listenerFill)" dot={false} activeDot={{ r: 4, fill: "#ed1b98", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="px-2 pb-1"><SectionAction href="/listeners">Open Listener Hub</SectionAction></div>
          </CardContent>
        </Card>

        <Card className="rounded-[22px] border-0 bg-card py-0 shadow-card ring-1 ring-border/80">
          <CardHeader className="flex flex-row items-center justify-between px-5 pb-2 pt-5">
            <CardTitle>Station health</CardTitle>
            <Badge variant="outline" className="gap-1.5 border-success/20 bg-success-soft text-success">
              <span className="size-1.5 rounded-full bg-success" /> All systems normal
            </Badge>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="divide-y divide-border/70">
              {stationHealth.map((item) => {
                const Icon = stationHealthIcons[item.kind]
                return (
                  <div key={item.label} className="flex items-center gap-3 py-3">
                    <span className="grid size-9 place-items-center rounded-full bg-brand-soft text-brand-indigo"><Icon className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="text-right text-[13px] font-medium">{item.value}</span>
                  </div>
                )
              })}
            </div>
            <SectionAction href="/station">View Premier Gospel status</SectionAction>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Card className="rounded-[22px] border-0 bg-card py-0 shadow-card ring-1 ring-border/80">
          <CardHeader className="px-5 pb-2 pt-5"><CardTitle>Today&apos;s production schedule</CardTitle></CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="hidden grid-cols-[1.1fr_1.35fr_1.15fr_.9fr_24px] gap-3 border-b border-border/80 pb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:grid">
              <span>Time</span><span>Show</span><span>Producer</span><span>Status</span><span />
            </div>
            <div className="divide-y divide-border/70">
              {schedule.map((item, index) => (
                <div key={item.show} className="grid gap-2 py-3 text-[12px] sm:grid-cols-[1.1fr_1.35fr_1.15fr_.9fr_24px] sm:items-center sm:gap-3">
                  <span className="text-muted-foreground">{item.time}</span>
                  <Link href={`/shows/${item.slug}`} className={index === 0 ? "font-medium text-brand-indigo hover:underline" : "font-medium hover:text-brand-indigo"}>{item.show}</Link>
                  <span className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-full bg-brand-soft text-[9px] font-semibold text-brand-indigo">{item.initials}</span>
                    {item.producer}
                  </span>
                  <Badge variant="secondary" className={index === 0 ? "w-fit bg-brand-soft text-brand-indigo" : "w-fit"}>{item.status}</Badge>
                  <button aria-label={`More options for ${item.show}`} className="hidden text-muted-foreground hover:text-foreground sm:block"><MoreHorizontal className="size-4" /></button>
                </div>
              ))}
            </div>
            <div className="pt-3"><SectionAction href="/shows">View all BroadcastOS shows</SectionAction></div>
          </CardContent>
        </Card>

        <Card className="rounded-[22px] border-0 bg-card py-0 shadow-card ring-1 ring-border/80">
          <CardHeader className="flex flex-row items-center justify-between px-5 pb-1 pt-5">
            <CardTitle>Review tasks</CardTitle>
            <Badge className="bg-brand-soft text-brand-indigo hover:bg-brand-soft">{reviewTasks.length}</Badge>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="divide-y divide-border/70">
              {reviewTasks.map((task) => {
                const Icon = task.kind === "copy" ? FileText : task.kind === "call" ? MessageSquareText : AudioLines
                return (
                  <button key={task.title} className="flex w-full items-center gap-3 py-3 text-left">
                    <span className="grid size-9 place-items-center rounded-full bg-brand-soft text-brand-indigo"><Icon className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium">{task.title}</span>
                      <span className="block text-[11px] text-muted-foreground">{task.meta}</span>
                    </span>
                    <span className={task.due === "Due today" ? "text-[10px] font-medium text-brand-magenta" : "text-[10px] text-muted-foreground"}>{task.due}</span>
                  </button>
                )
              })}
            </div>
            <SectionAction href="/review">Open show review</SectionAction>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-2 py-2 text-[11px] text-muted-foreground">
        <Sparkles className="size-3.5 text-brand-magenta" />
        {dashboardData.footer}
      </div>
    </div>
  )
}
