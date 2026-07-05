"use client"

import { useMemo, useState } from "react"
import {
  Archive,
  ArrowRight,
  BookOpenCheck,
  Check,
  CircleGauge,
  FilePlus2,
  Heart,
  Inbox,
  Link2,
  ListFilter,
  Newspaper,
  Radio,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  christianNewsFilters,
  goodNewsFeatures,
  goodNewsFilters,
  newsroomSources,
  newsroomStories,
  showAssignmentOptions,
  type NewsSource,
  type NewsStory,
  type NewsroomConnection,
  type StoryCategory,
  type StoryStatus,
} from "@/lib/newsroom-data"
import { cn } from "@/lib/utils"

type StoryState = Omit<NewsStory, "tags"> & { tags: readonly string[] }
type ShowName = keyof typeof showAssignmentOptions

const categoryTone: Record<StoryCategory, string> = {
  "Good News": "bg-emerald-50 text-emerald-700",
  "Christian News": "bg-violet-50 text-violet-700",
  Mainstream: "bg-slate-100 text-slate-700",
  "Science/Discovery": "bg-sky-50 text-sky-700",
  "Entertainment/Culture": "bg-pink-50 text-pink-700",
}

function ConnectionBadge({ connection }: { connection: NewsroomConnection }) {
  const style = connection === "Connected"
    ? "bg-success-soft text-success"
    : connection === "Future AI"
      ? "bg-fuchsia-50 text-fuchsia-700"
      : connection === "RSS/API needed"
        ? "bg-amber-50 text-amber-700"
        : "bg-muted text-muted-foreground"
  return <Badge className={style}>{connection}</Badge>
}

function StoryStatusBadge({ status }: { status: StoryStatus }) {
  const style = status === "Chosen"
    ? "bg-success-soft text-success"
    : status === "Assigned"
      ? "bg-brand-soft text-brand-indigo"
      : status === "Archived"
        ? "bg-muted text-muted-foreground"
        : "bg-amber-50 text-amber-700"
  return <Badge className={style}>{status}</Badge>
}

function Score({ label, value }: { label: string; value: number }) {
  const tone = value >= 85 ? "text-success" : value >= 70 ? "text-brand-indigo" : "text-amber-700"
  return (
    <div className="rounded-xl border bg-white px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-lg font-semibold", tone)}>{value}</p>
    </div>
  )
}

export function NewsroomPage() {
  const [stories, setStories] = useState<StoryState[]>(newsroomStories.map((story) => ({ ...story })))
  const [selectedStory, setSelectedStory] = useState<StoryState | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [workflowFilter, setWorkflowFilter] = useState("All")
  const [manualSource, setManualSource] = useState<NewsSource | null>(null)
  const [manualHeadline, setManualHeadline] = useState("")
  const [manualSummary, setManualSummary] = useState("")
  const [notice, setNotice] = useState("")
  const [assignmentShow, setAssignmentShow] = useState<ShowName>("Afternoons with Adam")
  const [assignmentHour, setAssignmentHour] = useState("Hour 1")
  const [assignmentLink, setAssignmentLink] = useState<string>(showAssignmentOptions["Afternoons with Adam"].links[0])
  const [assignmentFeature, setAssignmentFeature] = useState<string>(showAssignmentOptions["Afternoons with Adam"].features[0])
  const [assignmentNotes, setAssignmentNotes] = useState("")

  const visibleStories = useMemo(() => stories.filter((story) => {
    const matchesQuery = `${story.headline} ${story.source} ${story.category} ${story.summary}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (statusFilter === "All" || story.status === statusFilter)
  }), [query, statusFilter, stories])

  const metrics = [
    ["Good News stories", stories.filter((story) => story.category === "Good News" && story.status !== "Archived").length, "Hope-led options"],
    ["Christian News stories", stories.filter((story) => story.category === "Christian News" && story.status !== "Archived").length, "Faith and culture"],
    ["Mainstream stories", stories.filter((story) => story.category === "Mainstream" && story.status !== "Archived").length, "For Christian perspective"],
    ["Science / Discovery", stories.filter((story) => story.category === "Science/Discovery" && story.status !== "Archived").length, "Careful hope"],
    ["Entertainment / Culture", stories.filter((story) => story.category === "Entertainment/Culture" && story.status !== "Archived").length, "Music and events"],
    ["Stories assigned to shows", stories.filter((story) => story.status === "Assigned").length, "Producer Desk"],
    ["Stories needing review", stories.filter((story) => story.status === "Suggested").length, "Editorial decision"],
  ] as const

  function updateStory(id: string, status: StoryStatus) {
    setStories((current) => current.map((story) => story.id === id ? { ...story, status } : story))
    if (selectedStory?.id === id) setSelectedStory({ ...selectedStory, status })
    setNotice(`${stories.find((story) => story.id === id)?.headline ?? "Story"} marked ${status.toLowerCase()}.`)
  }

  function openStory(story: StoryState) {
    setSelectedStory(story)
    setAssignmentShow(story.suggestedShow)
    setAssignmentHour(story.placement.startsWith("Hour 2") ? "Hour 2" : story.placement.startsWith("Hour 3") ? "Hour 3" : "Hour 1")
    const options = showAssignmentOptions[story.suggestedShow]
    setAssignmentLink(options.links[0])
    setAssignmentFeature(options.features[0])
    setAssignmentNotes("")
  }

  function chooseShow(show: ShowName) {
    setAssignmentShow(show)
    setAssignmentHour("Hour 1")
    setAssignmentLink(showAssignmentOptions[show].links[0])
    setAssignmentFeature(showAssignmentOptions[show].features[0])
  }

  function assignStory() {
    if (!selectedStory) return
    setStories((current) => current.map((story) => story.id === selectedStory.id ? {
      ...story,
      status: "Assigned",
      suggestedShow: assignmentShow,
      placement: `${assignmentHour} · ${assignmentFeature}`,
    } : story))
    setNotice(`${selectedStory.headline} assigned to ${assignmentShow}, ${assignmentHour}.`)
    setSelectedStory(null)
  }

  function createManualStory() {
    if (!manualSource || !manualHeadline.trim() || !manualSummary.trim()) return
    const story: StoryState = {
      id: `manual-${Date.now()}`,
      headline: manualHeadline.trim(),
      source: manualSource.name,
      category: manualSource.category,
      date: "5 July 2026",
      summary: manualSummary.trim(),
      status: "Suggested",
      radioPotential: 70,
      christianPerspective: manualSource.category === "Christian News" ? 85 : 65,
      interaction: 68,
      prayerOpportunity: 55,
      hopeLevel: manualSource.category === "Good News" ? 82 : 65,
      sensitivity: "Medium",
      suggestedShow: "Afternoons with Adam",
      placement: "Hour 1 · editorial review",
      tags: [],
      prep: {
        whyRadio: "Editorial review needed before this story is prepared for air.",
        christianPerspective: "Add a grounded Christian perspective after checking the original source.",
        listenerQuestion: "Question not written yet.",
        prayerAngle: "Prayer angle not written yet.",
        safeWording: "Verify every factual claim against the original source.",
        toneWarning: "Sensitivity has not been assessed.",
        intro: "Intro not written yet.",
        outro: "Outro not written yet.",
        cta: "CTA not written yet.",
        linkLength: "TBC",
      },
    }
    setStories((current) => [story, ...current])
    setNotice(`${story.headline} added manually to the Story Inbox.`)
    setManualHeadline("")
    setManualSummary("")
    setManualSource(null)
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[30px] bg-[#10111a] text-white shadow-card">
        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <div className="absolute -right-20 -top-28 size-72 rounded-full bg-brand-magenta/10 blur-3xl" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <Badge className="border-white/10 bg-white/10 text-white"><Newspaper />Editorial command centre</Badge>
                <ConnectionBadge connection="Manual for now" />
                <ConnectionBadge connection="RSS/API needed" />
                <ConnectionBadge connection="Future AI" />
              </div>
              <h1 className="mt-5 text-[42px] font-semibold tracking-[-0.055em] sm:text-[58px]">Newsroom</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">Find the story, understand why it belongs on air, and place it into the right show without losing editorial judgement.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-white/55 xl:max-w-sm">
              <p className="flex items-center gap-2 font-semibold text-white"><ShieldAlert className="size-4 text-brand-magenta" />No live fetching is connected</p>
              <p className="mt-2">Every story below is mock or manually entered. RSS, APIs and AI remain clearly labelled future workflows.</p>
            </div>
          </div>
        </div>
        <div className="grid border-t border-white/10 bg-white/[0.035] sm:grid-cols-3">
          <div className="px-6 py-4 sm:px-8"><p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Stories in inbox</p><p className="mt-1 font-mono text-2xl font-semibold">{stories.filter((story) => story.status !== "Archived").length}</p></div>
          <div className="border-t border-white/10 px-6 py-4 sm:border-l sm:border-t-0 sm:px-8"><p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Editorial sources</p><p className="mt-1 font-mono text-2xl font-semibold">{newsroomSources.length}</p></div>
          <div className="border-t border-white/10 px-6 py-4 sm:border-l sm:border-t-0 sm:px-8"><p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Live connections</p><p className="mt-1 font-mono text-2xl font-semibold">0</p><p className="text-[10px] text-white/40">Honest by design</p></div>
        </div>
      </header>

      {notice && <div role="status" className="flex items-center gap-3 rounded-2xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success"><Check className="size-4" /><span className="flex-1">{notice}</span><button type="button" className="font-semibold" onClick={() => setNotice("")}>Dismiss</button></div>}

      <section aria-labelledby="newsroom-overview">
        <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Editorial pulse</p><h2 id="newsroom-overview" className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Newsroom overview</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {metrics.map(([label, value, note]) => (
            <Card key={label} className="rounded-[20px] shadow-sm">
              <CardContent className="p-4">
                <p className="min-h-8 text-xs font-medium leading-4">{label}</p>
                <p className="mt-3 font-mono text-2xl font-semibold tracking-[-0.04em]">{value}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Tabs defaultValue="inbox" className="flex-col gap-5" onValueChange={() => setWorkflowFilter("All")}>
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border bg-white p-1.5 shadow-sm">
          <TabsTrigger value="inbox" className="min-h-10 px-4"><Inbox />Story Inbox</TabsTrigger>
          <TabsTrigger value="sources" className="min-h-10 px-4"><Link2 />Source Library</TabsTrigger>
          <TabsTrigger value="good-news" className="min-h-10 px-4"><Sparkles />Good News</TabsTrigger>
          <TabsTrigger value="christian-news" className="min-h-10 px-4"><BookOpenCheck />Christian News</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Editorial queue</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Story Inbox</h2><p className="mt-1 text-sm text-muted-foreground">Select a story to open the full radio prep and assignment panel.</p></div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories" className="h-10 rounded-xl pl-9 sm:w-64" /></label>
                <select aria-label="Filter story status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                  {["All", "Suggested", "Chosen", "Assigned", "Archived"].map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {visibleStories.map((story) => (
                <StoryCard key={story.id} story={story} onOpen={() => openStory(story)} onStatus={(status) => updateStory(story.id, status)} />
              ))}
              {visibleStories.length === 0 && <div className="col-span-full rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground"><ListFilter className="mx-auto mb-3 size-5" />No stories match these filters.</div>}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="sources">
          <section>
            <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Editorial sources</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Source Library</h2><p className="mt-1 text-sm text-muted-foreground">These are research starting points, not live feeds.</p></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {newsroomSources.map((source) => (
                <Card key={source.id} className="rounded-[22px] shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Newspaper className="size-4" /></span><ConnectionBadge connection={source.connection} /></div>
                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em]">{source.name}</h3>
                    <div className="mt-3 flex flex-wrap gap-2"><Badge className={categoryTone[source.category]}>{source.category}</Badge><Badge variant="outline">{source.sourceType}</Badge></div>
                    <div className="mt-5 space-y-2 border-t pt-4 text-xs"><p className="flex justify-between gap-3"><span className="text-muted-foreground">Status</span><span className="text-right font-medium">{source.status}</span></p><p className="flex justify-between gap-3"><span className="text-muted-foreground">Last checked</span><span className="text-right">{source.lastChecked}</span></p></div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Button aria-label={`Add story manually from ${source.name}`} variant="outline" size="sm" className="rounded-xl" onClick={() => setManualSource(source)}><FilePlus2 />Add story manually</Button>
                      <Button aria-label={`Future fetch from ${source.name}`} variant="secondary" size="sm" className="rounded-xl" disabled title="Live fetching is not connected"><RefreshCw />Future fetch</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="good-news">
          <WorkflowSection
            eyebrow="Hope-led editorial"
            title="Good News workflow"
            description="Shape a hopeful story for a recurring feature without flattening nuance or overstating the facts."
            features={goodNewsFeatures}
            filters={goodNewsFilters}
            activeFilter={workflowFilter}
            onFilter={setWorkflowFilter}
            stories={stories.filter((story) => story.category === "Good News" && story.status !== "Archived" && (workflowFilter === "All" || story.tags.includes(workflowFilter)))}
            onOpen={openStory}
          />
        </TabsContent>

        <TabsContent value="christian-news">
          <WorkflowSection
            eyebrow="Faith and culture"
            title="Christian News workflow"
            description="Find the faithful angle, protect context and give listeners a clear reason to care."
            features={["Faith In The Headlines", "Sunday conversation", "Guest Conversation"]}
            filters={christianNewsFilters}
            activeFilter={workflowFilter}
            onFilter={setWorkflowFilter}
            stories={stories.filter((story) => story.category === "Christian News" && story.status !== "Archived" && (workflowFilter === "All" || story.tags.includes(workflowFilter)))}
            onOpen={openStory}
          />
        </TabsContent>
      </Tabs>

      <Sheet open={Boolean(selectedStory)} onOpenChange={(open) => !open && setSelectedStory(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl">
          {selectedStory && <>
            <div className="bg-ink p-6 text-white sm:p-8">
              <SheetHeader className="text-left">
                <div className="flex flex-wrap gap-2"><Badge className={categoryTone[selectedStory.category]}>{selectedStory.category}</Badge><StoryStatusBadge status={selectedStory.status} /></div>
                <SheetTitle className="pt-3 text-2xl leading-8 text-white">{selectedStory.headline}</SheetTitle>
                <SheetDescription className="text-white/55">{selectedStory.source} · {selectedStory.date}</SheetDescription>
              </SheetHeader>
              <p className="mt-5 text-sm leading-6 text-white/65">{selectedStory.summary}</p>
            </div>
            <div className="space-y-7 p-6 sm:p-8">
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Story scoring</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <Score label="Radio potential" value={selectedStory.radioPotential} />
                  <Score label="Hope level" value={selectedStory.hopeLevel} />
                  <Score label="Interaction" value={selectedStory.interaction} />
                  <Score label="Christian lens" value={selectedStory.christianPerspective} />
                  <div className="rounded-xl border bg-white px-3 py-2.5"><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Sensitivity</p><p className={cn("mt-1 text-sm font-semibold", selectedStory.sensitivity === "High" ? "text-destructive" : selectedStory.sensitivity === "Medium" ? "text-amber-700" : "text-success")}>{selectedStory.sensitivity}</p></div>
                </div>
              </section>

              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Story prep</p>
                <div className="mt-3 space-y-3">
                  {[
                    ["Why this works on radio", selectedStory.prep.whyRadio, Radio],
                    ["Christian perspective", selectedStory.prep.christianPerspective, BookOpenCheck],
                    ["Possible listener question", selectedStory.prep.listenerQuestion, UserRound],
                    ["Prayer angle", selectedStory.prep.prayerAngle, Heart],
                    ["Safe wording", selectedStory.prep.safeWording, ShieldAlert],
                    ["Tone warning", selectedStory.prep.toneWarning, ShieldAlert],
                  ].map(([label, copy, icon]) => {
                    const Icon = icon as typeof Radio
                    return <article key={label as string} className="rounded-2xl border p-4"><p className="flex items-center gap-2 text-xs font-semibold"><Icon className="size-4 text-brand-indigo" />{label as string}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy as string}</p></article>
                  })}
                </div>
              </section>

              <section className="rounded-2xl bg-brand-soft/45 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Suggested broadcast link</p>
                <div className="mt-4 space-y-4">
                  {[["Intro", selectedStory.prep.intro], ["Outro", selectedStory.prep.outro], ["CTA", selectedStory.prep.cta]].map(([label, copy]) => <div key={label}><p className="text-xs font-semibold">{label}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p></div>)}
                  <Badge variant="outline" className="bg-white"><CircleGauge />Estimated link · {selectedStory.prep.linkLength}</Badge>
                </div>
              </section>

              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Assign to Producer Desk</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Show"><select value={assignmentShow} onChange={(event) => chooseShow(event.target.value as ShowName)} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">{Object.keys(showAssignmentOptions).map((show) => <option key={show}>{show}</option>)}</select></Field>
                  <Field label="Hour"><select value={assignmentHour} onChange={(event) => setAssignmentHour(event.target.value)} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">{showAssignmentOptions[assignmentShow].hours.map((hour) => <option key={hour}>{hour}</option>)}</select></Field>
                  <Field label="Link"><select value={assignmentLink} onChange={(event) => setAssignmentLink(event.target.value)} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">{showAssignmentOptions[assignmentShow].links.map((link) => <option key={link}>{link}</option>)}</select></Field>
                  <Field label="Feature"><select value={assignmentFeature} onChange={(event) => setAssignmentFeature(event.target.value)} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">{showAssignmentOptions[assignmentShow].features.map((feature) => <option key={feature}>{feature}</option>)}</select></Field>
                </div>
                <Field label="Producer notes"><textarea value={assignmentNotes} onChange={(event) => setAssignmentNotes(event.target.value)} placeholder="Add the angle, source checks or handover note…" className="mt-1 min-h-28 w-full rounded-xl border bg-white p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring" /></Field>
                <Button className="primary-action mt-4 h-11 w-full rounded-xl text-white" onClick={assignStory}><Send />Assign story to Producer Desk</Button>
              </section>
            </div>
          </>}
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(manualSource)} onOpenChange={(open) => !open && setManualSource(null)}>
        <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-xl">
          {manualSource && <>
            <SheetHeader className="text-left"><div className="mb-2"><ConnectionBadge connection="Manual for now" /></div><SheetTitle>Add a story from {manualSource.name}</SheetTitle><SheetDescription>Paste the story details yourself. BroadcastOS will not claim this was fetched automatically.</SheetDescription></SheetHeader>
            <div className="mt-7 space-y-5">
              <label className="block"><span className="mb-2 block text-xs font-semibold">Headline</span><Input value={manualHeadline} onChange={(event) => setManualHeadline(event.target.value)} placeholder="Paste or write the headline" className="rounded-xl" /></label>
              <label className="block"><span className="mb-2 block text-xs font-semibold">Verified summary</span><textarea value={manualSummary} onChange={(event) => setManualSummary(event.target.value)} placeholder="Summarise only what the source supports…" className="min-h-56 w-full rounded-2xl border bg-muted/15 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring" /></label>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800"><strong>Editorial check required.</strong> Scores and radio prep begin as placeholders until Adam reviews the original source.</div>
              <Button className="primary-action w-full rounded-xl text-white" disabled={!manualHeadline.trim() || !manualSummary.trim()} onClick={createManualStory}><FilePlus2 />Add to Story Inbox</Button>
            </div>
          </>}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function StoryCard({ story, onOpen, onStatus }: { story: StoryState; onOpen: () => void; onStatus: (status: StoryStatus) => void }) {
  return (
    <Card className={cn("rounded-[22px] shadow-sm", story.status === "Archived" && "opacity-65")}>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-2"><Badge className={categoryTone[story.category]}>{story.category}</Badge><StoryStatusBadge status={story.status} /></div><span className="text-xs text-muted-foreground">{story.date}</span></div>
        <h3 className="mt-4 text-lg font-semibold leading-6 tracking-[-0.025em]">{story.headline}</h3>
        <p className="mt-2 text-xs font-medium text-brand-indigo">{story.source}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{story.summary}</p>
        <div className="mt-5 grid grid-cols-4 gap-2">
          <Score label="Radio" value={story.radioPotential} />
          <Score label="Christian" value={story.christianPerspective} />
          <Score label="Interaction" value={story.interaction} />
          <Score label="Prayer" value={story.prayerOpportunity} />
        </div>
        <div className="mt-5 rounded-xl bg-muted/45 p-3 text-xs"><p className="text-muted-foreground">Suggested placement</p><p className="mt-1 font-medium">{story.suggestedShow} · {story.placement}</p></div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button aria-label={`Open story prep for ${story.headline}`} size="sm" className="primary-action rounded-xl text-white" onClick={onOpen}><WandSparkles />Open story prep</Button>
          <Button aria-label={`Assign ${story.headline} to Producer Desk`} size="sm" variant="outline" className="rounded-xl" onClick={onOpen}><Send />Assign to Producer Desk</Button>
          {story.status !== "Chosen" && story.status !== "Assigned" && <Button aria-label={`Mark ${story.headline} as chosen`} size="sm" variant="outline" className="rounded-xl" onClick={() => onStatus("Chosen")}><Check />Mark chosen</Button>}
          {story.status !== "Archived" && <Button aria-label={`Archive ${story.headline}`} size="sm" variant="ghost" className="rounded-xl text-muted-foreground" onClick={() => onStatus("Archived")}><Archive />Archive</Button>}
        </div>
      </CardContent>
    </Card>
  )
}

function WorkflowSection({
  eyebrow,
  title,
  description,
  features,
  filters,
  activeFilter,
  onFilter,
  stories,
  onOpen,
}: {
  eyebrow: string
  title: string
  description: string
  features: readonly string[]
  filters: readonly string[]
  activeFilter: string
  onFilter: (filter: string) => void
  stories: StoryState[]
  onOpen: (story: StoryState) => void
}) {
  return (
    <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">{eyebrow}</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{title}</h2><p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p></div>
        <div className="flex flex-wrap gap-2">{features.map((feature) => <Badge key={feature} variant="outline" className="bg-brand-soft/45">{feature}</Badge>)}</div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button size="sm" variant={activeFilter === "All" ? "default" : "outline"} className={cn("rounded-full", activeFilter === "All" && "primary-action text-white")} onClick={() => onFilter("All")}>All</Button>
        {filters.map((filter) => <Button key={filter} size="sm" variant={activeFilter === filter ? "default" : "outline"} className={cn("rounded-full", activeFilter === filter && "primary-action text-white")} onClick={() => onFilter(filter)}>{filter}</Button>)}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {stories.map((story) => <button key={story.id} type="button" onClick={() => onOpen(story)} className="group rounded-2xl border p-5 text-left transition hover:border-brand-indigo/25 hover:bg-brand-soft/20"><div className="flex items-start justify-between gap-3"><div><Badge className={categoryTone[story.category]}>{story.category}</Badge><h3 className="mt-3 font-semibold leading-6">{story.headline}</h3><p className="mt-2 text-xs text-muted-foreground">{story.source} · {story.date}</p></div><ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" /></div><div className="mt-4 flex flex-wrap gap-2">{story.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[10px]">{tag}</span>)}</div></button>)}
        {stories.length === 0 && <div className="col-span-full rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">No stories match this editorial filter.</div>}
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold">{label}</span>{children}</label>
}
