"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  FilePlus2,
  GitBranch,
  History,
  Layers3,
  Lightbulb,
  ListChecks,
  MessageCircleMore,
  Mic2,
  Network,
  Radio,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  WandSparkles,
  Workflow,
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
  featureHistory,
  featureRelationships,
  featureTemplates,
  type BrainShow,
  type FeatureReadiness,
  type FeatureSource,
  type FeatureTemplate,
} from "@/lib/broadcast-brain-data"
import { cn } from "@/lib/utils"

type FeatureState = FeatureTemplate

const shows: readonly (BrainShow | "All shows")[] = ["All shows", "Sundays with Adam", "Afternoons with Adam", "Saturday Breakfast"]

function ReadinessBadge({ status }: { status: FeatureReadiness }) {
  const style = status === "Ready" ? "bg-success-soft text-success" : status === "Needs review" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"
  return <Badge className={style}>{status}</Badge>
}

function SourceBadge({ source }: { source: FeatureSource }) {
  const style = source === "Manual" ? "bg-slate-100 text-slate-700" : source === "Template" ? "bg-brand-soft text-brand-indigo" : "bg-fuchsia-50 text-fuchsia-700"
  return <Badge className={style}>{source}</Badge>
}

export function BroadcastBrainPage() {
  const [features, setFeatures] = useState<FeatureState[]>(featureTemplates.map((feature) => ({ ...feature })))
  const [selected, setSelected] = useState<FeatureState | null>(null)
  const [showFilter, setShowFilter] = useState<(typeof shows)[number]>("All shows")
  const [query, setQuery] = useState("")
  const [promptFeatureId, setPromptFeatureId] = useState("sunday-school")
  const [promptDrafts, setPromptDrafts] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState("")
  const [builder, setBuilder] = useState({
    name: "",
    show: "Sundays with Adam" as BrainShow,
    purpose: "",
    structure: "",
    presenter: "",
    producer: "",
    interaction: "",
    assets: "",
    prompt: "",
  })

  const filteredFeatures = useMemo(() => features.filter((feature) => {
    const matchesShow = showFilter === "All shows" || feature.showsUsedOn.includes(showFilter)
    const matchesQuery = `${feature.name} ${feature.purpose} ${feature.targetEmotion}`.toLowerCase().includes(query.toLowerCase())
    return matchesShow && matchesQuery
  }), [features, query, showFilter])

  const promptFeature = features.find((feature) => feature.id === promptFeatureId) ?? features[0]
  const totalPrompts = features.reduce((total, feature) => total + feature.prompts.length, 0)
  const metrics = [
    ["Total feature templates", features.length, "Across three shows", Layers3],
    ["Active features", features.filter((feature) => feature.readiness === "Ready").length, "Broadcast-ready", Activity],
    ["Features used this week", features.filter((feature) => feature.analytics.lastUsed === "This week").length, "Mock history", Radio],
    ["Features needing review", features.filter((feature) => feature.readiness === "Needs review" || feature.readiness === "Draft").length, "Editorial attention", ListChecks],
    ["Feature prompts ready", totalPrompts, "Stored templates", WandSparkles],
    ["Feature history items", featureHistory.length, "Preserved editions", History],
    ["Future AI actions", totalPrompts, "Not connected", Bot],
  ] as const

  function updatePrompt(featureId: string, prompt: string, value: string) {
    setPromptDrafts((current) => ({ ...current, [`${featureId}:${prompt}`]: value }))
  }

  function savePrompts() {
    setNotice(`${promptFeature.name} prompt templates saved locally. AI remains disconnected.`)
  }

  function createFeature() {
    if (!builder.name.trim() || !builder.purpose.trim()) return
    const id = `${builder.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`
    const feature: FeatureState = {
      id,
      name: builder.name.trim(),
      showsUsedOn: [builder.show],
      purpose: builder.purpose.trim(),
      mission: `Make ${builder.name.trim()} a clear, repeatable part of ${builder.show}.`,
      idealLength: "03:00–05:00",
      energyLevel: "To be defined",
      targetEmotion: "To be defined",
      interactionType: builder.interaction.trim() || "To be defined",
      readiness: "Draft",
      source: "Manual",
      idealPlacement: "To be tested in Producer Desk",
      requiredAssets: builder.assets.split(",").map((item) => item.trim()).filter(Boolean),
      presenterGuidance: builder.presenter.trim() || "Presenter guidance to be completed.",
      producerGuidance: builder.producer.trim() || "Producer guidance to be completed.",
      productionWorkflow: builder.structure.split("\n").map((item) => item.trim()).filter(Boolean),
      broadcastWorkflow: ["Set the promise", "Deliver the feature", "Invite interaction", "Exit cleanly"],
      interactionIdeas: [builder.interaction.trim() || "Interaction strategy to be completed."],
      suggestedCtas: ["CTA to be completed."],
      variations: ["Short version", "Extended version"],
      successMetrics: ["Timing", "Clarity", "Listener response"],
      history: ["v1.0 · Draft template created"],
      notes: "Draft feature created manually in Broadcast Brain.",
      prompts: builder.prompt.trim() ? [builder.prompt.trim()] : ["Future AI prompt to be completed"],
      analytics: {
        timesUsed: 0,
        averageDuration: "—",
        averageWhatsApps: 0,
        averageVoiceNotes: 0,
        engagement: "—",
        bestShow: builder.show,
        lastUsed: "Never",
      },
    }
    setFeatures((current) => [feature, ...current])
    setShowFilter("All shows")
    setNotice(`${feature.name} saved as a draft feature template.`)
    setBuilder({
      name: "",
      show: "Sundays with Adam",
      purpose: "",
      structure: "",
      presenter: "",
      producer: "",
      interaction: "",
      assets: "",
      prompt: "",
    })
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[30px] bg-[#10111a] text-white shadow-card">
        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-brand-magenta/10 blur-3xl" />
          <div className="absolute right-56 top-20 size-44 rounded-full bg-brand-indigo/20 blur-3xl" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <Badge className="border-white/10 bg-white/10 text-white"><BrainCircuit />Recurring feature intelligence</Badge>
                <Badge className="bg-fuchsia-50 text-fuchsia-700"><Bot />Future AI · not connected</Badge>
              </div>
              <h1 className="mt-5 text-[42px] font-semibold tracking-[-0.055em] sm:text-[58px]">Broadcast Brain</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">Teach BroadcastOS how every recurring feature works—its emotional purpose, production shape, live workflow and future intelligence.</p>
            </div>
            <div className="grid min-w-[280px] gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Templates</p><p className="mt-1 font-mono text-2xl font-semibold">{features.length}</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Live AI actions</p><p className="mt-1 font-mono text-2xl font-semibold">0</p></div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-white/[0.035] px-6 py-5 sm:px-9">
          <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-magenta" /><div><p className="text-sm font-semibold">Master source of truth</p><p className="mt-1 max-w-4xl text-xs leading-5 text-white/50">Producer Desk references Feature Library templates instead of hardcoding feature logic. Changing a template affects future shows while every historical show preserves the version used on air.</p></div></div>
        </div>
      </header>

      {notice && <div role="status" className="flex items-center gap-3 rounded-2xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success"><Check className="size-4" /><span className="flex-1">{notice}</span><button type="button" className="font-semibold" onClick={() => setNotice("")}>Dismiss</button></div>}

      <section aria-labelledby="brain-overview">
        <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">System intelligence</p><h2 id="brain-overview" className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Broadcast Brain overview</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {metrics.map(([label, value, note, Icon]) => (
            <Card key={label} className="rounded-[20px] shadow-sm">
              <CardContent className="p-4"><span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-indigo"><Icon className="size-4" /></span><p className="mt-4 min-h-8 text-xs font-medium leading-4">{label}</p><p className="mt-2 font-mono text-2xl font-semibold">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{note}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Tabs defaultValue="library" className="flex-col gap-5">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border bg-white p-1.5 shadow-sm">
          <TabsTrigger value="library" className="min-h-10 px-4"><Layers3 />Feature Library</TabsTrigger>
          <TabsTrigger value="prompts" className="min-h-10 px-4"><WandSparkles />Prompt Library</TabsTrigger>
          <TabsTrigger value="builder" className="min-h-10 px-4"><FilePlus2 />Feature Builder</TabsTrigger>
          <TabsTrigger value="analytics" className="min-h-10 px-4"><BarChart3 />Analytics & History</TabsTrigger>
          <TabsTrigger value="relationships" className="min-h-10 px-4"><Network />Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Reusable objects</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Feature Library</h2><p className="mt-1 text-sm text-muted-foreground">Each feature exists once and carries its DNA wherever future shows use it.</p></div>
              <label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search features" className="h-10 rounded-xl pl-9 xl:w-72" /></label>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {shows.map((show) => <Button key={show} size="sm" variant={showFilter === show ? "default" : "outline"} className={cn("rounded-full", showFilter === show && "primary-action text-white")} onClick={() => setShowFilter(show)}>{show}</Button>)}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredFeatures.map((feature) => <FeatureCard key={feature.id} feature={feature} onOpen={() => setSelected(feature)} />)}
              {filteredFeatures.length === 0 && <div className="col-span-full rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">No feature templates match this search.</div>}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="prompts">
          <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
            <Card className="rounded-[24px] shadow-sm">
              <CardContent className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Future intelligence</p>
                <h2 className="mt-2 text-xl font-semibold">Feature Prompt Library</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Templates are editable now; running them requires a future AI connection.</p>
                <label className="mt-6 block"><span className="mb-2 block text-xs font-semibold">Feature</span><select aria-label="Prompt feature" value={promptFeatureId} onChange={(event) => setPromptFeatureId(event.target.value)} className="h-11 w-full rounded-xl border bg-white px-3 text-sm">{features.map((feature) => <option key={feature.id} value={feature.id}>{feature.name}</option>)}</select></label>
                <div className="mt-5 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-4 text-xs leading-5 text-fuchsia-800"><p className="flex items-center gap-2 font-semibold"><Bot className="size-4" />Future AI · not connected yet</p><p className="mt-2">Saving changes only updates the mock prompt template.</p></div>
              </CardContent>
            </Card>
            <Card className="rounded-[24px] shadow-sm">
              <CardContent className="p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">{promptFeature.showsUsedOn.join(" · ")}</p><h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{promptFeature.name} prompts</h3></div><Badge className="bg-fuchsia-50 text-fuchsia-700"><Bot />Future AI</Badge></div>
                <div className="mt-6 space-y-3">
                  {promptFeature.prompts.map((prompt) => {
                    const key = `${promptFeature.id}:${prompt}`
                    return <article key={prompt} className="rounded-2xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{prompt}</p><Badge variant="outline">Not connected yet</Badge></div><textarea aria-label={`${prompt} prompt template`} value={promptDrafts[key] ?? `Using the stored DNA for ${promptFeature.name}, ${prompt.toLowerCase()}. Respect the show tone, target emotion, ideal duration, presenter guidance and verified source material.`} onChange={(event) => updatePrompt(promptFeature.id, prompt, event.target.value)} className="mt-3 min-h-24 w-full rounded-xl border bg-muted/15 p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring" /><Button size="sm" variant="secondary" className="mt-3 rounded-xl" disabled><Bot />Run with Future AI</Button></article>
                  })}
                </div>
                <Button className="primary-action mt-5 w-full rounded-xl text-white" onClick={savePrompts}><Save />Save prompt templates</Button>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="builder">
          <FeatureBuilder builder={builder} setBuilder={setBuilder} onSave={createFeature} />
        </TabsContent>

        <TabsContent value="analytics">
          <section className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-3">
              {features.slice(0, 6).map((feature) => (
                <Card key={feature.id} className="rounded-[22px] shadow-sm"><CardContent className="p-5"><div className="flex items-start justify-between gap-2"><div><p className="text-xs text-muted-foreground">{feature.showsUsedOn[0]}</p><h3 className="mt-1 font-semibold">{feature.name}</h3></div><span className="font-mono text-xl font-semibold text-brand-indigo">{feature.analytics.engagement}</span></div><div className="mt-5 grid grid-cols-3 gap-2 text-center"><AnalyticsMini label="Uses" value={String(feature.analytics.timesUsed)} /><AnalyticsMini label="WhatsApps" value={String(feature.analytics.averageWhatsApps)} /><AnalyticsMini label="Voice notes" value={String(feature.analytics.averageVoiceNotes)} /></div><p className="mt-4 text-xs text-muted-foreground">Best on {feature.analytics.bestShow} · Average {feature.analytics.averageDuration} · Last used {feature.analytics.lastUsed}</p></CardContent></Card>
              ))}
            </div>
            <Card className="rounded-[24px] shadow-sm"><CardContent className="p-5 sm:p-7"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Preserved editions</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Feature history</h2></div><div className="mt-5 divide-y">{featureHistory.map((item) => <div key={`${item.feature}-${item.edition}`} className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_1.3fr_.7fr_1fr] sm:items-center"><span className="font-semibold">{item.feature}</span><span>{item.edition}</span><span className="text-muted-foreground">{item.date} · {item.version}</span><span className="text-muted-foreground">{item.result}</span></div>)}</div></CardContent></Card>
          </section>
        </TabsContent>

        <TabsContent value="relationships">
          <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Object map</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Feature relationships</h2><p className="mt-1 text-sm text-muted-foreground">See the reusable objects each feature depends on.</p></div>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {featureRelationships.map((relationship) => <Card key={relationship.feature} className="rounded-[24px] border-brand-indigo/10 bg-brand-soft/25 shadow-sm"><CardContent className="p-6"><span className="grid size-11 place-items-center rounded-2xl bg-white text-brand-indigo shadow-sm"><GitBranch className="size-5" /></span><h3 className="mt-5 text-lg font-semibold">{relationship.feature}</h3><p className="mt-1 text-xs text-muted-foreground">uses</p><div className="mt-4 flex flex-wrap gap-2">{relationship.uses.map((item) => <span key={item} className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs"><ChevronRight className="size-3 text-brand-magenta" />{item}</span>)}</div></CardContent></Card>)}
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-3xl">
          {selected && <FeatureDna feature={selected} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function FeatureCard({ feature, onOpen }: { feature: FeatureState; onOpen: () => void }) {
  return (
    <Card className="rounded-[22px] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-indigo/20 hover:shadow-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Workflow className="size-[18px]" /></span><div className="flex flex-wrap justify-end gap-1.5"><ReadinessBadge status={feature.readiness} /><SourceBadge source={feature.source} /></div></div>
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-indigo">{feature.showsUsedOn.join(" · ")}</p>
        <h3 className="mt-2 text-lg font-semibold leading-6 tracking-[-0.025em]">{feature.name}</h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{feature.purpose}</p>
        <div className="mt-5 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-muted/50 p-3"><p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Length</p><p className="mt-1 font-medium">{feature.idealLength}</p></div><div className="rounded-xl bg-muted/50 p-3"><p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Energy</p><p className="mt-1 font-medium">{feature.energyLevel}</p></div><div className="rounded-xl bg-muted/50 p-3"><p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Emotion</p><p className="mt-1 font-medium">{feature.targetEmotion}</p></div><div className="rounded-xl bg-muted/50 p-3"><p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Interaction</p><p className="mt-1 truncate font-medium">{feature.interactionType}</p></div></div>
        <Button aria-label={`View Feature DNA for ${feature.name}`} variant="outline" className="mt-5 w-full rounded-xl" onClick={onOpen}>View Feature DNA<ArrowRight /></Button>
      </CardContent>
    </Card>
  )
}

function FeatureDna({ feature }: { feature: FeatureState }) {
  const sections = [
    ["Mission", feature.mission, Target],
    ["Purpose", feature.purpose, Lightbulb],
    ["Presenter guidance", feature.presenterGuidance, Mic2],
    ["Producer guidance", feature.producerGuidance, ListChecks],
    ["Notes", feature.notes, BookOpenCheck],
  ] as const
  return (
    <>
      <div className="bg-ink p-6 text-white sm:p-8">
        <SheetHeader className="text-left"><div className="flex flex-wrap gap-2"><ReadinessBadge status={feature.readiness} /><SourceBadge source={feature.source} /></div><SheetTitle className="pt-3 text-3xl leading-9 text-white">{feature.name}</SheetTitle><SheetDescription className="text-white/55">{feature.showsUsedOn.join(" · ")}</SheetDescription></SheetHeader>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Length", feature.idealLength], ["Energy", feature.energyLevel], ["Emotion", feature.targetEmotion], ["Interaction", feature.interactionType]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[9px] uppercase tracking-[0.12em] text-white/40">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>)}</div>
      </div>
      <div className="space-y-7 p-6 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-2">{sections.map(([title, copy, Icon]) => <article key={title} className="rounded-2xl border p-4"><p className="flex items-center gap-2 text-xs font-semibold"><Icon className="size-4 text-brand-indigo" />{title}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></article>)}</div>
        <DnaList title="Required assets" icon={Layers3} items={feature.requiredAssets} />
        <div className="grid gap-4 sm:grid-cols-2"><DnaList title="Production workflow" icon={Workflow} items={feature.productionWorkflow} numbered /><DnaList title="Broadcast workflow" icon={Radio} items={feature.broadcastWorkflow} numbered /></div>
        <div className="grid gap-4 sm:grid-cols-2"><DnaList title="Listener interaction ideas" icon={MessageCircleMore} items={feature.interactionIdeas} /><DnaList title="Suggested CTAs" icon={Mic2} items={feature.suggestedCtas} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><DnaList title="Possible variations" icon={Sparkles} items={feature.variations} /><DnaList title="Success metrics" icon={BarChart3} items={feature.successMetrics} /></div>
        <DnaList title="History" icon={History} items={feature.history} />
        <section className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-5"><div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm font-semibold text-fuchsia-800"><Bot className="size-4" />Stored AI prompt templates</p><Badge className="bg-white text-fuchsia-700">Future AI · not connected</Badge></div><div className="mt-4 flex flex-wrap gap-2">{feature.prompts.map((prompt) => <span key={prompt} className="rounded-full border border-fuchsia-200 bg-white px-3 py-1.5 text-xs text-fuchsia-800">{prompt}</span>)}</div></section>
        <section className="rounded-2xl bg-brand-soft/45 p-5"><p className="text-sm font-semibold">Ideal placement</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.idealPlacement}</p></section>
      </div>
    </>
  )
}

function DnaList({ title, icon: Icon, items, numbered = false }: { title: string; icon: typeof Layers3; items: readonly string[]; numbered?: boolean }) {
  return <section className="rounded-2xl border p-5"><p className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-brand-indigo" />{title}</p><div className="mt-4 space-y-2">{items.map((item, index) => <div key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-[10px] font-semibold text-brand-indigo">{numbered ? index + 1 : "•"}</span><p>{item}</p></div>)}</div></section>
}

function FeatureBuilder({ builder, setBuilder, onSave }: { builder: { name: string; show: BrainShow; purpose: string; structure: string; presenter: string; producer: string; interaction: string; assets: string; prompt: string }; setBuilder: React.Dispatch<React.SetStateAction<{ name: string; show: BrainShow; purpose: string; structure: string; presenter: string; producer: string; interaction: string; assets: string; prompt: string }>>; onSave: () => void }) {
  function set(key: keyof typeof builder, value: string) {
    setBuilder((current) => ({ ...current, [key]: value }))
  }
  return (
    <section className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
      <Card className="rounded-[24px] bg-ink text-white shadow-card"><CardContent className="p-6 sm:p-7"><span className="grid size-11 place-items-center rounded-2xl bg-white/10"><FilePlus2 className="size-5 text-brand-magenta" /></span><h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">Create a feature template</h2><p className="mt-3 text-sm leading-6 text-white/55">Define the repeatable object once. Future Producer Desk builds can reference it without duplicating feature logic.</p><div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-white/50"><strong className="text-white/80">Manual for now.</strong> Saving creates a local mock template; no AI or database persistence is active.</div></CardContent></Card>
      <Card className="rounded-[24px] shadow-sm"><CardContent className="p-5 sm:p-7"><div className="grid gap-4 sm:grid-cols-2"><BuilderField label="Feature name"><Input value={builder.name} onChange={(event) => set("name", event.target.value)} placeholder="e.g. Proof There’s Still Good" className="rounded-xl" /></BuilderField><BuilderField label="Show"><select value={builder.show} onChange={(event) => set("show", event.target.value)} className="h-10 w-full rounded-xl border bg-white px-3 text-sm"><option>Sundays with Adam</option><option>Afternoons with Adam</option><option>Saturday Breakfast</option></select></BuilderField></div><BuilderField label="Purpose"><textarea value={builder.purpose} onChange={(event) => set("purpose", event.target.value)} placeholder="What job does this feature do for the listener?" className="min-h-24 w-full rounded-xl border bg-muted/15 p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring" /></BuilderField><BuilderField label="Typical structure"><textarea value={builder.structure} onChange={(event) => set("structure", event.target.value)} placeholder={"One production step per line\nSet the promise\nDeliver the core moment\nInvite interaction"} className="min-h-28 w-full rounded-xl border bg-muted/15 p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring" /></BuilderField><div className="grid gap-4 sm:grid-cols-2"><BuilderField label="Presenter notes"><textarea value={builder.presenter} onChange={(event) => set("presenter", event.target.value)} className="min-h-24 w-full rounded-xl border p-3 text-sm" /></BuilderField><BuilderField label="Producer notes"><textarea value={builder.producer} onChange={(event) => set("producer", event.target.value)} className="min-h-24 w-full rounded-xl border p-3 text-sm" /></BuilderField><BuilderField label="Interaction strategy"><Input value={builder.interaction} onChange={(event) => set("interaction", event.target.value)} placeholder="WhatsApp, voice notes, question…" /></BuilderField><BuilderField label="Required assets"><Input value={builder.assets} onChange={(event) => set("assets", event.target.value)} placeholder="Comma-separated assets" /></BuilderField></div><BuilderField label="AI prompt placeholder"><textarea value={builder.prompt} onChange={(event) => set("prompt", event.target.value)} placeholder="Stored only. Future AI is not connected." className="min-h-24 w-full rounded-xl border border-fuchsia-200 bg-fuchsia-50/50 p-3 text-sm" /></BuilderField><Button className="primary-action mt-2 w-full rounded-xl text-white" disabled={!builder.name.trim() || !builder.purpose.trim()} onClick={onSave}><Save />Save feature template</Button></CardContent></Card>
    </section>
  )
}

function BuilderField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mb-4 block"><span className="mb-2 block text-xs font-semibold">{label}</span>{children}</label>
}

function AnalyticsMini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/50 p-3"><p className="font-mono text-lg font-semibold">{value}</p><p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p></div>
}
