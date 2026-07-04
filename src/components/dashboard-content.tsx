"use client"

import { useState } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Check,
  ChevronDown,
  CircleEllipsis,
  FileAudio,
  FileText,
  Headphones,
  MessageSquareText,
  Mic2,
  MoreHorizontal,
  Radio,
  Sparkles,
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
import { listenerData, reviewTasks, schedule, stationHealth } from "@/lib/mock-data"

function SectionAction({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-2 text-[12px] font-medium text-foreground transition-colors hover:text-brand-indigo">
      {children}
      <ArrowRight className="size-3.5" />
    </button>
  )
}

export function DashboardContent() {
  const [range, setRange] = useState("This week")
  const [studioOpen, setStudioOpen] = useState(false)

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-5 pt-5 sm:flex-row sm:items-end sm:justify-between lg:pr-0">
        <div>
          <h1 className="text-balance text-[34px] font-semibold tracking-[-0.04em] sm:text-[46px]">Good morning, Alex</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Here&apos;s what&apos;s happening with your station today.</p>
        </div>
        <Button
          size="lg"
          onClick={() => setStudioOpen((value) => !value)}
          className="primary-action h-12 rounded-xl px-5 text-white shadow-[0_10px_28px_rgba(17,19,35,.16)] sm:self-start"
        >
          {studioOpen ? <Check /> : <AudioLines />}
          {studioOpen ? "Studio ready" : "Open studio"}
        </Button>
      </header>

      <section className="soft-gradient flex flex-col gap-5 rounded-[22px] border border-brand-indigo/10 px-5 py-5 shadow-[0_10px_40px_rgba(28,33,61,.04)] lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-indigo">
            <Mic2 className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-indigo">On air in 24 min</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em]">The Morning Edit</h2>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>07:00–10:00</span>
              <Badge variant="secondary" className="bg-brand-soft text-brand-indigo">Live assist</Badge>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            [FileText, "Edit rundown"],
            [Headphones, "Studio connect"],
            [MessageSquareText, "Send to talent"],
            [CircleEllipsis, "More actions"],
          ].map(([Icon, label]) => (
            <button key={label as string} className="flex min-w-[118px] flex-col items-center gap-2 rounded-xl px-3 py-3 text-xs font-medium transition-colors hover:bg-white/80">
              <Icon className="size-5" strokeWidth={1.8} />
              {label as string}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Card className="rounded-[22px] border-0 bg-card py-0 shadow-card ring-1 ring-border/80">
          <CardHeader className="flex flex-row items-start justify-between px-5 pb-0 pt-5 sm:px-6">
            <div>
              <CardTitle className="text-base">Listeners this week</CardTitle>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-[32px] font-semibold tracking-[-0.04em]">128.7K</span>
                <Badge className="mb-1 bg-success-soft text-success hover:bg-success-soft"><ArrowUpRight /> 12.4%</Badge>
                <span className="mb-1.5 hidden text-[11px] text-muted-foreground sm:inline">vs last week</span>
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
            <div className="px-2 pb-1"><SectionAction>View listener insights</SectionAction></div>
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
              {stationHealth.map((item, index) => {
                const Icon = [Radio, AudioLines, FileAudio, Users][index]
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
            <SectionAction>View station status</SectionAction>
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
                  <span className={index === 0 ? "font-medium text-brand-indigo" : "font-medium"}>{item.show}</span>
                  <span className="flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-full bg-brand-soft text-[9px] font-semibold text-brand-indigo">{item.initials}</span>
                    {item.producer}
                  </span>
                  <Badge variant="secondary" className={index === 0 ? "w-fit bg-brand-soft text-brand-indigo" : "w-fit"}>{item.status}</Badge>
                  <button aria-label={`More options for ${item.show}`} className="hidden text-muted-foreground hover:text-foreground sm:block"><MoreHorizontal className="size-4" /></button>
                </div>
              ))}
            </div>
            <div className="pt-3"><SectionAction>View full schedule</SectionAction></div>
          </CardContent>
        </Card>

        <Card className="rounded-[22px] border-0 bg-card py-0 shadow-card ring-1 ring-border/80">
          <CardHeader className="flex flex-row items-center justify-between px-5 pb-1 pt-5">
            <CardTitle>Review tasks</CardTitle>
            <Badge className="bg-brand-soft text-brand-indigo hover:bg-brand-soft">4</Badge>
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
            <SectionAction>View all tasks</SectionAction>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-2 py-2 text-[11px] text-muted-foreground">
        <Sparkles className="size-3.5 text-brand-magenta" />
        Mock station data · Synced moments ago
      </div>
    </div>
  )
}
