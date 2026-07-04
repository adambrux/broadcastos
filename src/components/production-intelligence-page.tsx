"use client"

import { useMemo, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BookOpenText,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Copy,
  FileSearch,
  FileText,
  Globe2,
  Lightbulb,
  Link2,
  LoaderCircle,
  MessageSquareQuote,
  Mic2,
  Newspaper,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  UserSearch,
  WandSparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ToolId =
  | "brief"
  | "good-news"
  | "christian-news"
  | "script"
  | "sunday-school"
  | "guest"
  | "links"
  | "review"

type Tool = {
  id: ToolId
  title: string
  shortTitle: string
  description: string
  icon: LucideIcon
  prompt: string
  action: string
}

type ResultSection = {
  eyebrow: string
  title: string
  body: string
  meta?: string
  tone?: "indigo" | "pink" | "green" | "amber"
}

const tools: Tool[] = [
  {
    id: "brief",
    title: "Weekly brief extraction",
    shortTitle: "Brief extraction",
    description: "Turn a station briefing into usable production actions.",
    icon: FileSearch,
    prompt: "Extract all items relevant to Sundays with Adam, including mandatory reads, liners and music.",
    action: "Extract brief",
  },
  {
    id: "good-news",
    title: "Good news search",
    shortTitle: "Good news",
    description: "Find uplifting stories with strong on-air potential.",
    icon: Globe2,
    prompt: "Positive community stories from the UK this week with a hopeful, human angle.",
    action: "Search stories",
  },
  {
    id: "christian-news",
    title: "Christian news search",
    shortTitle: "Christian news",
    description: "Surface faith stories for a thoughtful Christian perspective.",
    icon: Newspaper,
    prompt: "Current UK Christian news suitable for a warm Sunday morning conversation.",
    action: "Search news",
  },
  {
    id: "script",
    title: "Script generation",
    shortTitle: "Script writer",
    description: "Draft presenter-ready links in the show’s own voice.",
    icon: MessageSquareQuote,
    prompt: "Write the 09:00 welcome into the opening worship song. Include time, date and WhatsApp CTA.",
    action: "Generate script",
  },
  {
    id: "sunday-school",
    title: "Sunday School production notes",
    shortTitle: "Sunday School",
    description: "Build a complete three-part teaching package.",
    icon: BookOpenText,
    prompt: "Create a three-part lesson about holding on to hope when the answer is delayed.",
    action: "Build lesson",
  },
  {
    id: "guest",
    title: "Guest research",
    shortTitle: "Guest research",
    description: "Prepare useful angles, context and interview questions.",
    icon: UserSearch,
    prompt: "Prepare Guvna B for a Saturday Breakfast guest conversation about faith, creativity and resilience.",
    action: "Research guest",
  },
  {
    id: "links",
    title: "Broadcast link suggestions",
    shortTitle: "Link suggestions",
    description: "Create concise link ideas around the running order.",
    icon: Link2,
    prompt: "Suggest three links between Sunday School Part 3, a listener voice note and the next song.",
    action: "Suggest links",
  },
  {
    id: "review",
    title: "Show review summaries",
    shortTitle: "Review summary",
    description: "Turn production notes into clear learning and actions.",
    icon: ClipboardCheck,
    prompt: "Summarise the latest Sundays with Adam review, highlighting pacing, interaction and next actions.",
    action: "Summarise review",
  },
]

const results: Record<ToolId, ResultSection[]> = {
  brief: [
    { eyebrow: "Mandatory read", title: "Premier Marketplace · Summer Reading P2", body: "Place once between 10:20 and 11:20. Use the supplied 30-second copy without adaptation.", meta: "Deadline · Sunday 12:00", tone: "pink" },
    { eyebrow: "Station liner", title: "Hope is here this summer", body: "One natural live read in Hour 3. Best fit: after Track of the Week and before Faith and Finance.", meta: "Suggested · 11:18", tone: "indigo" },
    { eyebrow: "Music", title: "Track of the Week", body: "Use the supplied clean radio edit and include artist, title and Premier Gospel positioning in the intro.", meta: "Asset supplied", tone: "green" },
    { eyebrow: "Forward promotion", title: "Premier Plus", body: "Mention catch-up listening once during the final hour. Keep it under 20 seconds and do not place beside another CTA.", meta: "One mention", tone: "amber" },
  ],
  "good-news": [
    { eyebrow: "Best fit", title: "Community pantry turns surplus into Sunday lunches", body: "A volunteer-led project is pairing donated ingredients with free shared meals, giving the story warmth, people and an easy listener question.", meta: "Community · 2-minute link", tone: "green" },
    { eyebrow: "Strong alternative", title: "Pay-it-forward café reaches its 10,000th meal", body: "A simple generosity idea has become a neighbourhood ritual. Useful for a hopeful conversation about small actions becoming culture.", meta: "Generosity · Interview possible", tone: "indigo" },
    { eyebrow: "Quick mention", title: "Youth choir wins funding for a summer tour", body: "Celebratory and music-adjacent, with a clear local voice-note opportunity if the choir can supply a short reaction.", meta: "Music · 45-second read", tone: "pink" },
  ],
  "christian-news": [
    { eyebrow: "Lead conversation", title: "Churches open shared cool spaces during heatwave", body: "A practical service story with a natural Christian perspective: hospitality as public witness, especially for older and isolated neighbours.", meta: "Verify date, location and organiser", tone: "indigo" },
    { eyebrow: "Culture", title: "Gospel artist announces community writing workshops", body: "A useful bridge between music and discipleship. Ask what creative spaces helped listeners find confidence or faith.", meta: "Confirm artist statement", tone: "pink" },
    { eyebrow: "Service", title: "Faith charities coordinate emergency family support", body: "Frame around collaboration and dignity rather than institutional promotion. Identify a first-hand spokesperson before broadcast.", meta: "Needs two-source verification", tone: "amber" },
  ],
  script: [
    { eyebrow: "Suggested script · 00:42", title: "Welcome to the Sunday Show Congregation", body: "Good morning and welcome to Sundays with Adam. It is nine o’clock on Sunday 5 July, and wherever you are listening, you are part of the family this morning. The Sunday Show Congregation is gathering, so send me your name, your town and your church on WhatsApp. We’ll begin together with a song that makes room for hope.", meta: "Warm · conversational · inclusive", tone: "indigo" },
    { eyebrow: "Producer direction", title: "Land the invitation", body: "Smile through the opening line, pause after the date, and give the WhatsApp instruction once. Let the song vocal arrive cleanly.", meta: "Out of Sunday opener bed", tone: "green" },
  ],
  "sunday-school": [
    { eyebrow: "Lesson spine", title: "Hope while you wait", body: "Golden text: Hebrews 10:23. Before question: Where are you being asked to trust before you can see the outcome? After question: What one faithful action will you take this week?", meta: "Podcast title · The courage to keep holding on", tone: "indigo" },
    { eyebrow: "Part 1 · The tension", title: "Waiting is not standing still", body: "Open with an everyday picture of delayed answers. Introduce the listener question and establish that faith can be active even when circumstances look unchanged.", meta: "04:30 · curious and welcoming", tone: "pink" },
    { eyebrow: "Part 2 · The text", title: "The promise and the Promiser", body: "Reveal Hebrews 10:23, pause after the reading, then connect God’s faithfulness to three ordinary choices: prayer, honesty and showing up again.", meta: "05:00 · warm organ under text only", tone: "amber" },
    { eyebrow: "Part 3 · The practice", title: "Choose the next faithful step", body: "Resolve with one action for the coming week. Return to audience answers, then close with the phrase: hope is not denial; it is direction.", meta: "04:45 · hopeful acoustic bed", tone: "green" },
  ],
  guest: [
    { eyebrow: "Conversation angle", title: "Faith that survives the edit", body: "Explore how belief, grief, ambition and British identity shape the work behind the public image. Keep the conversation personal without making it confessional.", meta: "Best for a 7–9 minute interview", tone: "indigo" },
    { eyebrow: "Opening question", title: "Start with the person, not the biography", body: "When life is moving quickly, what helps you notice what God is doing beneath the noise?", meta: "Warm open · no long setup", tone: "green" },
    { eyebrow: "Follow-ups", title: "Three useful routes", body: "What did resilience look like before it felt inspiring? How has your creative process changed? What do you hope a young listener hears in your latest work?", meta: "Choose two, keep one in reserve", tone: "pink" },
    { eyebrow: "Producer check", title: "Confirm before air", body: "Current project title, release date, preferred introduction, name pronunciation and any topics the guest would rather avoid.", meta: "Guest sheet incomplete", tone: "amber" },
  ],
  links: [
    { eyebrow: "Link 1 · 00:35", title: "Let the lesson breathe", body: "That line is worth carrying into the week: hope is not denial; it is direction. I want to know the one faithful step you are choosing next.", meta: "CTA · WhatsApp one action", tone: "indigo" },
    { eyebrow: "Link 2 · 00:48", title: "Bring in the listener", body: "You have been answering with such honesty this morning. Here is a voice note from Michelle in Croydon, who says waiting has changed the way she prays.", meta: "Play selected voice note", tone: "pink" },
    { eyebrow: "Link 3 · 00:22", title: "Release into music", body: "If you are still finding the words, let this next song hold the prayer for you. Stay with us on Premier Gospel.", meta: "Station ID · hit clean vocal", tone: "green" },
  ],
  review: [
    { eyebrow: "What worked", title: "The congregation felt genuinely present", body: "Adam used names naturally, responded to the substance of messages and made new listeners feel included without interrupting the established roll call.", meta: "Interaction quality · strong", tone: "green" },
    { eyebrow: "Watch next week", title: "Hour 2 lost six minutes", body: "The transition into Sunday School Part 2 repeated the lesson setup. Tightening the reintroduction to one sentence would protect the final audience response.", meta: "Pacing · needs attention", tone: "amber" },
    { eyebrow: "Best link", title: "Pastor Yvonne reflection response", body: "The 09:43 back-announcement was warm, specific and brief. It connected the reflection to one listener voice note without adding a second sermon.", meta: "Use as coaching example", tone: "indigo" },
    { eyebrow: "Actions", title: "Three changes for the next show", body: "Pre-select four roll-call responses. Cap Sunday School reintroductions at 20 seconds. Move the Premier Plus CTA away from the final prayer.", meta: "Owner · Adam Brooks", tone: "pink" },
  ],
}

const toneStyles = {
  indigo: "bg-brand-soft text-brand-indigo",
  pink: "bg-pink-50 text-brand-magenta",
  green: "bg-success-soft text-success",
  amber: "bg-amber-50 text-amber-700",
}

export function ProductionIntelligencePage() {
  const [activeId, setActiveId] = useState<ToolId>("brief")
  const [prompts, setPrompts] = useState<Record<ToolId, string>>(
    Object.fromEntries(tools.map((tool) => [tool.id, tool.prompt])) as Record<ToolId, string>
  )
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState("")
  const [fileName, setFileName] = useState("Premier weekly briefing · 5 July.pdf")
  const fileRef = useRef<HTMLInputElement>(null)
  const activeTool = useMemo(() => tools.find((tool) => tool.id === activeId) ?? tools[0], [activeId])

  function selectTool(id: ToolId) {
    setActiveId(id)
    setNotice("")
  }

  function runTool() {
    setRunning(true)
    setNotice("")
    window.setTimeout(() => {
      setRunning(false)
      setNotice(`${activeTool.title} updated with mock production output.`)
    }, 650)
  }

  function copyResults() {
    const text = results[activeId].map((item) => `${item.title}\n${item.body}`).join("\n\n")
    void navigator.clipboard?.writeText(text)
    setNotice("Output copied to clipboard.")
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-brand-soft text-brand-indigo">
              <WandSparkles className="size-3.5" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-indigo">Production intelligence</p>
          </div>
          <h1 className="text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">Research. Shape. Broadcast.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            One calm workspace for the research, writing and review work around every show.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-7 gap-1.5 bg-white px-3 text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" />
            Mock workspace
          </Badge>
          <Button variant="outline" className="h-10 rounded-xl bg-white px-4" onClick={() => setNotice("Recent production outputs refreshed.")}>
            <RefreshCw />
            Refresh
          </Button>
        </div>
      </header>

      <Card className="soft-gradient gap-0 rounded-[22px] border-0 py-0 shadow-card ring-1 ring-border/80">
        <CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-indigo text-white"><Mic2 className="size-4.5" /></span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Show context</p>
              <button className="mt-0.5 flex items-center gap-2 text-left text-sm font-semibold">
                Sundays with Adam <ChevronDown className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 border-border lg:border-l lg:pl-6">
            <Clock3 className="size-4 text-muted-foreground" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Broadcast</p>
              <p className="mt-0.5 text-sm font-semibold">Sunday 5 July · 09:00</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground lg:justify-end">
            <span className="size-2 rounded-full bg-success" />
            Show DNA connected
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[286px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-2" aria-label="Intelligence tools">
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Choose a workflow</p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {tools.map((tool) => {
              const Icon = tool.icon
              const active = activeId === tool.id
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => selectTool(tool.id)}
                  className={cn(
                    "group flex min-h-[76px] w-full min-w-0 items-center gap-3 overflow-hidden rounded-2xl border bg-white p-3.5 text-left shadow-[0_5px_24px_rgba(24,23,45,.035)] transition-all hover:-translate-y-0.5 hover:border-brand-indigo/25",
                    active && "border-brand-indigo/20 bg-brand-soft/75 ring-2 ring-brand-indigo/10"
                  )}
                >
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground", active && "bg-white text-brand-indigo shadow-sm")}>
                    <Icon className="size-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm font-semibold", active && "text-brand-indigo")}>{tool.shortTitle}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{tool.description}</span>
                  </span>
                  <ArrowRight className={cn("size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5", active && "text-brand-indigo")} />
                </button>
              )
            })}
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <Card className="gap-0 overflow-visible rounded-[22px] border-0 py-0 shadow-card ring-1 ring-border/80">
            <CardContent className="p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-white">
                    <activeTool.icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold tracking-[-0.025em]">{activeTool.title}</h2>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{activeTool.description}</p>
                  </div>
                </div>
                {activeId === "brief" && (
                  <>
                    <input
                      ref={fileRef}
                      type="file"
                      className="sr-only"
                      onChange={(event) => setFileName(event.target.files?.[0]?.name ?? fileName)}
                    />
                    <Button variant="outline" className="h-9 rounded-xl bg-white" onClick={() => fileRef.current?.click()}>
                      <Upload />
                      Replace brief
                    </Button>
                  </>
                )}
              </div>

              {activeId === "brief" && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed bg-muted/35 p-3.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-white text-brand-indigo shadow-sm"><FileText className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{fileName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Mock upload · ready to extract</p>
                  </div>
                  <Badge variant="secondary" className="hidden sm:inline-flex">PDF</Badge>
                </div>
              )}

              <label className="mt-6 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground" htmlFor="intelligence-prompt">
                Production request
              </label>
              <div className="mt-2 rounded-2xl border bg-background/50 p-2 focus-within:border-brand-indigo/30 focus-within:ring-2 focus-within:ring-brand-indigo/10">
                <textarea
                  id="intelligence-prompt"
                  value={prompts[activeId]}
                  onChange={(event) => setPrompts((current) => ({ ...current, [activeId]: event.target.value }))}
                  rows={3}
                  className="w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-6 outline-none placeholder:text-muted-foreground"
                />
                <div className="flex flex-col gap-2 border-t pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="bg-white">Pastoral tone</Badge>
                    <Badge variant="secondary" className="bg-white">Adam’s voice</Badge>
                    <Badge variant="secondary" className="bg-white">UK context</Badge>
                  </div>
                  <Button className="primary-action h-10 rounded-xl px-4" onClick={runTool} disabled={running}>
                    {running ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
                    {running ? "Working…" : activeTool.action}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-[22px] border-0 py-0 shadow-card ring-1 ring-border/80">
            <CardContent className="p-5 sm:p-7">
              <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-[-0.02em]">Production output</h2>
                    <Badge className="bg-success-soft text-success">Ready</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Generated from mock information for interface demonstration.</p>
                </div>
                <Button variant="outline" className="h-9 rounded-xl bg-white" onClick={copyResults}>
                  <Copy />
                  Copy output
                </Button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {results[activeId].map((item) => (
                  <article key={`${activeId}-${item.title}`} className="rounded-2xl border bg-white p-4.5 transition-colors hover:border-brand-indigo/20">
                    <div className="flex items-center justify-between gap-3">
                      <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", toneStyles[item.tone ?? "indigo"])}>
                        {item.eyebrow}
                      </span>
                      <Lightbulb className="size-3.5 text-muted-foreground/45" />
                    </div>
                    <h3 className="mt-3 text-[15px] font-semibold leading-5">{item.title}</h3>
                    <p className="mt-2 text-[13px] leading-[1.65] text-muted-foreground">{item.body}</p>
                    {item.meta && <p className="mt-3 border-t pt-3 text-[11px] font-medium text-foreground/65">{item.meta}</p>}
                  </article>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-ink p-4 text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-white/10"><ShieldCheck className="size-3.5" /></span>
                  <div>
                    <p className="text-sm font-medium">Editorial check required</p>
                    <p className="mt-0.5 text-xs leading-5 text-white/60">Names, dates, claims and source material must be verified before broadcast.</p>
                  </div>
                </div>
                <Button variant="outline" className="h-9 shrink-0 rounded-xl border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white" onClick={() => setNotice("Marked ready for producer review.")}>
                  <Check />
                  Mark for review
                </Button>
              </div>
            </CardContent>
          </Card>

          {notice && (
            <div role="status" className="flex items-center gap-2 rounded-xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success">
              <Check className="size-4" />
              {notice}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
