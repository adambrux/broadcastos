"use client"

import { useMemo, useState } from "react"
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDot,
  File,
  FileText,
  Heart,
  Inbox,
  Link2,
  Mail,
  Megaphone,
  Mic2,
  MoreHorizontal,
  MoveRight,
  Radio,
  Send,
  Settings2,
  ShieldAlert,
  Sparkles,
  Upload,
  Users,
  Volume2,
  WandSparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NowOnAirBanner } from "@/components/now-on-air-banner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  extractedBriefItems,
  initialAssignments,
  productionStandards,
  stationCampaigns,
  stationLiners,
  stationMetrics,
  stationPrayerPoints,
  weeklyBriefs,
  type StationShow,
} from "@/lib/station-data"
import { cn } from "@/lib/utils"

type AssignmentStatus = "Assigned" | "Needs placement" | "Used" | "Skipped"
type AssignableItem = { id: string; title: string; type: string }
type BriefItem = { id: string; title: string; week: string; received: string; source: string; status: string }
type ExtractedItem = { id: string; category: string; title: string; body: string; priority: string; assigned: string }
type ShowAssignment = { id: string; item: string; type: string; show: StationShow; link: string; status: AssignmentStatus }

const shows: readonly StationShow[] = ["Sundays with Adam", "Afternoons with Adam", "Saturday Breakfast"]
const assignmentStatuses: readonly AssignmentStatus[] = ["Assigned", "Needs placement", "Used", "Skipped"]

const metricIcons = {
  brief: Inbox,
  campaigns: Megaphone,
  liners: Radio,
  prayer: Heart,
  production: Settings2,
  compliance: ShieldAlert,
  assigned: CheckCircle2,
  unassigned: MoveRight,
}

const extractionIcons: Record<string, typeof Heart> = {
  "Prayer point": Heart,
  "Station campaign": Megaphone,
  Liner: Radio,
  "Presenter reminder": Mic2,
  "Producer reminder": Settings2,
  "Technical reminder": Volume2,
  "Upcoming event": CalendarDays,
  Appeal: Sparkles,
  Competition: CircleDot,
  "Marketplace read": BriefcaseBusiness,
  "Guest lead": Users,
  "Compliance note": ShieldAlert,
}

const uploadSources = [
  { label: "Word document", detail: ".doc or .docx", icon: FileText },
  { label: "PDF", detail: ".pdf", icon: File },
  { label: "Email text", detail: "Paste an email", icon: Mail },
  { label: "Plain text", detail: "Paste raw copy", icon: FileText },
] as const

const showLinks: Record<StationShow, readonly string[]> = {
  "Sundays with Adam": ["09:24 · Opening prayer", "09:55 · Sunday School promo", "11:19 · Station liner", "11:58 · Handover"],
  "Afternoons with Adam": ["Hour 1 · Welcome", "Hour 2 · Faith In The Headlines", "Hour 2 · Prayer Pause", "Hour 3 · Handover"],
  "Saturday Breakfast": ["07:02 · Weekend welcome", "08:56 · Station read", "09:05 · Events", "09:52 · Final prayer"],
}

function statusStyle(status: string) {
  if (status === "Active" || status === "Processed" || status === "Used") return "bg-success-soft text-success"
  if (status === "Needs review" || status === "Needs placement" || status === "Draft") return "bg-amber-50 text-amber-700"
  if (status === "New" || status === "Assigned" || status === "Scheduled") return "bg-brand-soft text-brand-indigo"
  return "bg-muted text-muted-foreground"
}

export function StationLayerPage() {
  const [activeTab, setActiveTab] = useState("brief")
  const [briefs, setBriefs] = useState<BriefItem[]>(weeklyBriefs.map((brief) => ({ ...brief })))
  const [extracted, setExtracted] = useState<ExtractedItem[]>(extractedBriefItems.map((item) => ({ ...item })))
  const [notice, setNotice] = useState("")
  const [originalOpen, setOriginalOpen] = useState(false)
  const [standardsEnabled, setStandardsEnabled] = useState<string[]>(productionStandards.map((standard) => standard.id))
  const [assignments, setAssignments] = useState<ShowAssignment[]>(initialAssignments.map((item) => ({ ...item, show: item.show as StationShow, status: item.status as AssignmentStatus })))
  const [assigning, setAssigning] = useState<AssignableItem | null>(null)
  const [assignmentShow, setAssignmentShow] = useState<StationShow>("Sundays with Adam")
  const [assignmentLink, setAssignmentLink] = useState(showLinks["Sundays with Adam"][0])

  const unassigned = extracted.filter((item) => item.assigned === "Unassigned")
  const currentBrief = briefs[0]

  const assignmentsByShow = useMemo(() => shows.map((show) => ({
    show,
    items: assignments.filter((assignment) => assignment.show === show),
  })), [assignments])

  function processBrief() {
    setBriefs((current) => current.map((brief, index) => index === 0 ? { ...brief, status: "Processed" } : brief))
    setNotice("Weekly brief processed: 12 broadcast elements extracted for review.")
  }

  function updateExtracted(id: string, key: "title" | "body" | "assigned", value: string) {
    setExtracted((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item))
  }

  function openAssignment(item: AssignableItem, preferredShow?: StationShow) {
    const nextShow = preferredShow ?? "Sundays with Adam"
    setAssigning(item)
    setAssignmentShow(nextShow)
    setAssignmentLink(showLinks[nextShow][0])
  }

  function chooseAssignmentShow(show: StationShow) {
    setAssignmentShow(show)
    setAssignmentLink(showLinks[show][0])
  }

  function confirmAssignment() {
    if (!assigning) return
    setAssignments((current) => [...current, {
      id: `${assigning.id}-${Date.now()}`,
      item: assigning.title,
      type: assigning.type,
      show: assignmentShow,
      link: assignmentLink,
      status: "Assigned",
    }])
    setExtracted((current) => current.map((item) => item.id === assigning.id ? { ...item, assigned: assignmentShow } : item))
    setNotice(`${assigning.title} assigned to ${assignmentShow} · ${assignmentLink}.`)
    setAssigning(null)
  }

  function cycleAssignmentStatus(id: string) {
    setAssignments((current) => current.map((assignment) => {
      if (assignment.id !== id) return assignment
      const currentIndex = assignmentStatuses.indexOf(assignment.status)
      return { ...assignment, status: assignmentStatuses[(currentIndex + 1) % assignmentStatuses.length] }
    }))
  }

  function toggleStandard(id: string) {
    setStandardsEnabled((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  return (
    <div className="space-y-6">
      <header className="soft-gradient overflow-hidden rounded-[26px] border border-brand-indigo/10 p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="bg-brand-soft text-brand-indigo"><Radio />Premier Gospel</Badge>
              <Badge variant="outline" className="bg-white/70">Station intelligence</Badge>
            </div>
            <h1 className="text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">Station Layer</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Turn Premier Gospel’s weekly briefing into clear, reusable broadcast elements for every show.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-11 rounded-xl bg-white" onClick={() => setOriginalOpen(true)}><FileText />View current brief</Button>
            <Button className="primary-action h-11 rounded-xl px-5 text-white" onClick={processBrief}><WandSparkles />Process weekly brief</Button>
          </div>
        </div>
      </header>

      <NowOnAirBanner />

      {notice && (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success">
          <Check className="size-4 shrink-0" />
          <span className="flex-1">{notice}</span>
          <button type="button" className="text-xs font-semibold" onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}

      <section aria-labelledby="station-overview">
        <div className="mb-3 flex items-end justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">This week</p><h2 id="station-overview" className="mt-1 text-xl font-semibold tracking-[-0.03em]">Station overview</h2></div>
          <p className="hidden text-xs text-muted-foreground sm:block">Week of 6 July 2026 · mock data</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stationMetrics.map((metric) => {
            const Icon = metricIcons[metric.kind]
            const displayValue = metric.kind === "brief" ? currentBrief.status : metric.value
            return (
              <Card key={metric.label} className="rounded-[20px] py-0 shadow-card ring-border/80">
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Icon className="size-4" /></span>
                  <span className="min-w-0"><span className="block truncate text-xl font-semibold tracking-[-0.04em]">{displayValue}</span><span className="block truncate text-xs font-medium">{metric.label}</span><span className="block truncate text-[10px] text-muted-foreground">{metric.note}</span></span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-col gap-4">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-muted/70 p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="brief" className="h-9 rounded-xl px-4">Brief & extraction</TabsTrigger>
          <TabsTrigger value="liners" className="h-9 rounded-xl px-4">Liners</TabsTrigger>
          <TabsTrigger value="campaigns" className="h-9 rounded-xl px-4">Campaigns</TabsTrigger>
          <TabsTrigger value="prayer" className="h-9 rounded-xl px-4">Prayer Centre</TabsTrigger>
          <TabsTrigger value="standards" className="h-9 rounded-xl px-4">Standards</TabsTrigger>
          <TabsTrigger value="assignments" className="h-9 rounded-xl px-4">Assignments <Badge variant="secondary">{assignments.length}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
            <div className="space-y-5">
              <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
                <CardHeader className="px-5 pb-3 pt-5">
                  <CardTitle className="flex items-center gap-2"><Upload className="size-4 text-brand-indigo" />Weekly Brief Inbox</CardTitle>
                  <p className="text-xs text-muted-foreground">Add the briefing in the format it arrives.</p>
                </CardHeader>
                <CardContent className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
                  {uploadSources.map(({ label, detail, icon: Icon }) => (
                    <button key={label} type="button" onClick={() => setNotice(`${label} mock upload ready. Real file processing will be connected later.`)} className="group rounded-2xl border border-dashed bg-muted/20 p-4 text-left transition-colors hover:border-brand-indigo/30 hover:bg-brand-soft/40">
                      <span className="grid size-9 place-items-center rounded-xl bg-white text-brand-indigo shadow-sm"><Icon className="size-4" /></span>
                      <span className="mt-3 block text-xs font-semibold">{label}</span>
                      <span className="mt-1 block text-[10px] text-muted-foreground">{detail}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
                <CardHeader className="flex flex-row items-start justify-between px-5 pb-2 pt-5">
                  <div><CardTitle>Current week</CardTitle><p className="mt-1 text-xs text-muted-foreground">{currentBrief.week}</p></div>
                  <Badge className={statusStyle(currentBrief.status)}>{currentBrief.status}</Badge>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="rounded-2xl border bg-white p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><FileText className="size-4" /></span>
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{currentBrief.title}</p><p className="mt-1 text-[10px] text-muted-foreground">{currentBrief.source} · received {currentBrief.received}</p></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" onClick={processBrief} className="primary-action rounded-xl text-white"><WandSparkles />Process brief</Button>
                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setOriginalOpen(true)}><FileText />View original</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
                <CardHeader className="px-5 pb-2 pt-5"><CardTitle>Previous briefings</CardTitle></CardHeader>
                <CardContent className="divide-y px-5 pb-4">
                  {briefs.slice(1).map((brief) => (
                    <div key={brief.id} className="flex items-center gap-3 py-3">
                      <File className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{brief.week}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{brief.source} · {brief.received}</p></div>
                      <Badge className={cn("text-[9px]", statusStyle(brief.status))}>{brief.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
              <CardHeader className="flex flex-row items-start justify-between px-5 pb-3 pt-5 sm:px-6">
                <div><CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-brand-magenta" />Extraction Panel</CardTitle><p className="mt-1.5 text-xs text-muted-foreground">Editable mock output, ready to assign across the station.</p></div>
                <Badge className="bg-brand-soft text-brand-indigo">{extracted.length} elements</Badge>
              </CardHeader>
              <CardContent className={cn("px-5 pb-5 sm:px-6", currentBrief.status === "Processed" && "grid gap-3 sm:grid-cols-2")}>
                {currentBrief.status !== "Processed" ? (
                  <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
                    <div>
                      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-indigo"><WandSparkles className="size-5" /></span>
                      <p className="mt-4 text-sm font-semibold">Ready to extract the weekly brief</p>
                      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-muted-foreground">Process the current briefing to identify prayer points, campaigns, liners, reminders, events and compliance notes.</p>
                      <Button size="sm" className="primary-action mt-4 rounded-xl text-white" onClick={processBrief}><WandSparkles />Process brief</Button>
                    </div>
                  </div>
                ) : extracted.map((item) => {
                  const Icon = extractionIcons[item.category] ?? FileText
                  return (
                    <article key={item.id} data-testid={`extraction-${item.id}`} className="rounded-2xl border bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Icon className="size-4" /></span>
                        <div className="flex flex-wrap justify-end gap-1"><Badge variant="outline" className="text-[9px]">{item.category}</Badge><Badge className={cn("text-[9px]", item.priority === "High" ? "bg-rose-50 text-rose-700" : item.priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground")}>{item.priority}</Badge></div>
                      </div>
                      <input aria-label={`${item.category} title`} value={item.title} onChange={(event) => updateExtracted(item.id, "title", event.target.value)} className="mt-3 w-full border-0 bg-transparent p-0 text-sm font-semibold outline-none" />
                      <textarea aria-label={`${item.title} content`} value={item.body} onChange={(event) => updateExtracted(item.id, "body", event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl bg-muted/40 p-3 text-xs leading-5 outline-none focus:ring-2 focus:ring-brand-indigo/20" />
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] text-muted-foreground">{item.assigned}</span>
                        <Button data-testid={`assign-${item.id}`} size="sm" variant="outline" className="h-8 rounded-xl bg-white text-[10px]" onClick={() => openAssignment({ id: item.id, title: item.title, type: item.category })}><Send />Assign</Button>
                      </div>
                    </article>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="liners">
          <SectionHeader title="Station Liners Library" description="Approved and draft live reads, with usage and placement controls." count={`${stationLiners.length} liners`} />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {stationLiners.map((liner) => (
              <Card key={liner.id} className="rounded-[22px] py-0 shadow-card ring-border/80">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div><Badge variant="outline" className="bg-white text-[9px]">{liner.campaign}</Badge><h3 className="mt-3 text-lg font-semibold tracking-[-0.025em]">{liner.title}</h3></div>
                    <Badge className={statusStyle(liner.status)}>{liner.status}</Badge>
                  </div>
                  <blockquote className="mt-4 rounded-2xl bg-brand-soft/55 p-4 text-sm font-medium leading-6">“{liner.script}”</blockquote>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Fact label="Active dates" value={liner.activeDates} />
                    <Fact label="Priority" value={liner.priority} />
                    <Fact label="Used" value={`${liner.usageCount} times`} />
                  </div>
                  <p className="mt-4 text-[10px] text-muted-foreground">Assigned: {liner.assignedShows.length ? liner.assignedShows.join(", ") : "No shows yet"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => openAssignment({ id: liner.id, title: liner.title, type: "Liner" })} className="primary-action rounded-xl text-white"><Send />Assign to show</Button>
                    <Button size="sm" variant="outline" onClick={() => openAssignment({ id: liner.id, title: liner.title, type: "Liner" })} className="rounded-xl"><Link2 />Assign to link</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <SectionHeader title="Campaign Manager" description="Station priorities with planned placement and usage across Premier Gospel." count={`${stationCampaigns.length} campaigns`} />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {stationCampaigns.map((campaign) => (
              <Card key={campaign.id} className="rounded-[22px] py-0 shadow-card ring-border/80">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-indigo">{campaign.dates}</p><h3 className="mt-2 text-lg font-semibold">{campaign.title}</h3></div><Badge className={statusStyle(campaign.status)}>{campaign.status}</Badge></div>
                  <p className="mt-3 text-sm leading-6">{campaign.objective}</p>
                  <div className="mt-4 rounded-2xl bg-muted/45 p-4"><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Suggested placement</p><p className="mt-2 text-xs leading-5">{campaign.placement}</p></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2"><Fact label="Target shows" value={campaign.shows.join(", ")} /><Fact label="Times used" value={`${campaign.used}`} /></div>
                  <div className="mt-4 border-t pt-4"><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Producer notes</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{campaign.notes}</p></div>
                  <Button size="sm" className="primary-action mt-4 rounded-xl text-white" onClick={() => openAssignment({ id: campaign.id, title: campaign.title, type: "Campaign" })}><Send />Assign campaign</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prayer">
          <SectionHeader title="Prayer Centre" description="Pastoral guidance, approved wording and sensitivity controls for prayer on air." count={`${stationPrayerPoints.length} prayer points`} />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {stationPrayerPoints.map((prayer) => (
              <Card key={prayer.id} className="rounded-[22px] py-0 shadow-card ring-border/80">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", prayer.sensitivity === "Sensitive" ? "bg-rose-50 text-rose-600" : "bg-brand-soft text-brand-indigo")}><Heart className="size-5" /></span>
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold">{prayer.subject}</h3><Badge className={prayer.visibility === "Private" ? "bg-slate-100 text-slate-700" : "bg-success-soft text-success"}>{prayer.visibility}</Badge></div><p className="mt-1 text-[10px] text-muted-foreground">Sensitivity: {prayer.sensitivity}</p></div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-brand-indigo/10 bg-brand-soft/45 p-4"><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-indigo">Suggested wording</p><p className="mt-2 text-sm font-medium leading-6">“{prayer.wording}”</p></div>
                  <p className="mt-4 text-[10px] text-muted-foreground">Assigned: {prayer.assigned}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" className="primary-action rounded-xl text-white" onClick={() => openAssignment({ id: prayer.id, title: `${prayer.subject} prayer`, type: "Prayer" })}><Send />Assign to show</Button>
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={() => openAssignment({ id: prayer.id, title: `${prayer.subject} prayer`, type: "Prayer" })}><Link2 />Assign to link</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="standards">
          <SectionHeader title="Production Standards" description="Station-wide reminders that can later surface inside BroadcastOS Live." count={`${standardsEnabled.length}/${productionStandards.length} live-ready`} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {productionStandards.map((standard) => {
              const enabled = standardsEnabled.includes(standard.id)
              return (
                <Card key={standard.id} className={cn("rounded-[22px] py-0 shadow-card ring-border/80 transition-colors", enabled && "border-brand-indigo/15")}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4"><span className={cn("grid size-10 place-items-center rounded-xl", enabled ? "bg-brand-soft text-brand-indigo" : "bg-muted text-muted-foreground")}><Volume2 className="size-4" /></span><Switch checked={enabled} onCheckedChange={() => toggleStandard(standard.id)} aria-label={`Make ${standard.title} available in BroadcastOS Live`} /></div>
                    <h3 className="mt-4 text-base font-semibold">{standard.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{standard.detail}</p>
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/45 px-3 py-2.5"><span className="text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">Live reminder</span><span className="text-[10px] font-medium">{standard.liveReminder}</span></div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <SectionHeader title="Show Assignment Board" description="Every station item has a destination, placement and usage state." count={`${assignments.length} assigned items`} />
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            {assignmentsByShow.map(({ show, items }) => (
              <Card key={show} className="rounded-[22px] py-0 shadow-card ring-border/80">
                <CardHeader className="flex flex-row items-start justify-between px-5 pb-3 pt-5"><div><CardTitle className="text-base">{show}</CardTitle><p className="mt-1 text-[10px] text-muted-foreground">{items.length} station items</p></div><Badge variant="outline">{items.filter((item) => item.status === "Used").length} used</Badge></CardHeader>
                <CardContent className="space-y-2 px-4 pb-5">
                  {items.map((assignment) => (
                    <div key={assignment.id} className="rounded-2xl border bg-white p-4">
                      <div className="flex items-start justify-between gap-3"><div><Badge variant="secondary" className="text-[9px]">{assignment.type}</Badge><p className="mt-2 text-xs font-semibold">{assignment.item}</p></div><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon-sm" variant="ghost" aria-label={`Change status for ${assignment.item}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Assignment status</DropdownMenuLabel><DropdownMenuSeparator />{assignmentStatuses.map((status) => <DropdownMenuItem key={status} onClick={() => setAssignments((current) => current.map((item) => item.id === assignment.id ? { ...item, status } : item))}>{status}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div>
                      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground"><Link2 className="size-3" />{assignment.link}</p>
                      <button type="button" onClick={() => cycleAssignmentStatus(assignment.id)} className={cn("mt-3 rounded-full px-2.5 py-1 text-[9px] font-semibold", statusStyle(assignment.status))}>{assignment.status}</button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-4 rounded-[22px] py-0 shadow-card ring-border/80">
            <CardHeader className="flex flex-row items-start justify-between px-5 pb-3 pt-5"><div><CardTitle>Unassigned station items</CardTitle><p className="mt-1 text-xs text-muted-foreground">Resolve these before the next programme build.</p></div><Badge className="bg-amber-50 text-amber-700">{unassigned.length}</Badge></CardHeader>
            <CardContent className="grid gap-2 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
              {unassigned.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-white p-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700"><ArrowRight className="size-3.5" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{item.title}</p><p className="mt-0.5 text-[9px] text-muted-foreground">{item.category}</p></div><Button variant="ghost" size="icon-sm" onClick={() => openAssignment({ id: item.id, title: item.title, type: item.category })} aria-label={`Assign ${item.title}`}><Send /></Button></div>)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={originalOpen} onOpenChange={setOriginalOpen}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl" side="right">
          <SheetHeader className="soft-gradient border-b p-6 pr-14">
            <SheetTitle className="flex items-center gap-2 text-xl"><FileText className="size-5 text-brand-indigo" />Premier Gospel Weekly Briefing</SheetTitle>
            <SheetDescription>Week of 6 July 2026 · received 3 July at 16:42</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 p-6">
            <div className="rounded-2xl border bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-indigo">Campaigns & people</p><p className="mt-3 text-sm leading-7">Please use the Guess The Judas YouTube liner. Promote the free e-book from Truth for Life. Pray for Andy Peck following his cancer diagnosis. Thank listeners for supporting the Premier Gospel appeal. Please note that Uzoma is leaving after more than 16 years of service.</p></div>
            <div className="rounded-2xl border bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-indigo">Production & technical</p><p className="mt-3 text-sm leading-7">Clear unnecessary Burli files. Review the radio staff working-hours email. Watch audio-level spikes and dips, make transitions smooth, avoid keyboard clicks and desk tapping, fully open and close faders, and avoid dead air.</p></div>
            <div className="rounded-2xl border bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-indigo">Presentation</p><p className="mt-3 text-sm leading-7">Give time, station and name checks at least twice per hour. Speak conversationally to one listener, avoid radio speak, and tease ahead.</p></div>
            <Badge variant="outline" className="bg-white">Mock original · Word document</Badge>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(assigning)} onOpenChange={(open) => !open && setAssigning(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-lg" side="right">
          <SheetHeader className="border-b p-6 pr-14">
            <SheetTitle className="flex items-center gap-2 text-xl"><Send className="size-5 text-brand-indigo" />Assign station item</SheetTitle>
            <SheetDescription>{assigning?.title} · choose a show and placement.</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Show</p>
              <div className="mt-3 grid gap-2">
                {shows.map((show) => <button key={show} type="button" onClick={() => chooseAssignmentShow(show)} className={cn("flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition-colors", assignmentShow === show ? "border-brand-indigo/20 bg-brand-soft text-brand-indigo" : "bg-white hover:bg-muted/40")}>{show}{assignmentShow === show && <Check className="size-4" />}</button>)}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Show link</p>
              <div className="mt-3 space-y-2">
                {showLinks[assignmentShow].map((link) => <button key={link} type="button" onClick={() => setAssignmentLink(link)} className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left text-xs", assignmentLink === link ? "border-brand-indigo/20 bg-brand-soft" : "bg-white")}><span className={cn("grid size-5 place-items-center rounded-full border", assignmentLink === link && "border-brand-indigo bg-brand-indigo text-white")}>{assignmentLink === link && <Check className="size-3" />}</span>{link}</button>)}
              </div>
            </div>
            <Button className="primary-action h-11 w-full rounded-xl text-white" onClick={confirmAssignment}><Send />Confirm assignment</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function SectionHeader({ title, description, count }: { title: string; description: string; count: string }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-semibold tracking-[-0.03em]">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><Badge variant="outline" className="w-fit bg-white">{count}</Badge></div>
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/45 p-3"><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p><p className="mt-1.5 text-[10px] font-medium leading-4">{value}</p></div>
}
