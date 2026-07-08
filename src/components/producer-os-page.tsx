"use client"

import { useState } from "react"
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CirclePlus,
  Clock3,
  FileAudio,
  FileImage,
  FileText,
  Gauge,
  MoreHorizontal,
  Radio,
  Target,
  Upload,
  UserRound,
} from "lucide-react"

import { ProducerRollCallBuilder } from "@/components/producer-roll-call-builder"
import { NowOnAirBanner } from "@/components/now-on-air-banner"
import { StationBriefPanel } from "@/components/station-brief-panel"
import { SundaySchoolModule } from "@/components/sunday-school-module"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { showProfiles } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type LinkCard = {
  id: string
  time: string
  title: string
  objective: string
  energy: string
  duration: string
  script: string
  cta: string
  reminders: string
  stationRequirements: string
  next: string
  notes: string
  ready: readonly string[]
}

const readinessItems = ["Script approved", "CTA ready", "Audio loaded", "Timing checked", "Station requirement placed"] as const

const hours = [
  {
    id: "hour-1",
    number: "01",
    time: "09:00–10:00",
    title: "Welcome & Congregation",
    purpose: "Gather the family, establish warmth and make every listener feel seen.",
    requiredLinks: 7,
    missing: ["Final voice-note order"],
    completed: 6,
    interactionGoal: "18 roll-call replies · 4 voice notes",
    status: "Nearly ready",
  },
  {
    id: "hour-2",
    number: "02",
    time: "10:00–11:00",
    title: "Sunday School",
    purpose: "Teach with clarity, create reflection and turn the lesson into lived faith.",
    requiredLinks: 7,
    missing: ["Part 2 final mix", "Hotline consent"],
    completed: 5,
    interactionGoal: "12 lesson answers · 1 hotline note",
    status: "In production",
  },
  {
    id: "hour-3",
    number: "03",
    time: "11:00–12:00",
    title: "Music, Life & Prayer",
    purpose: "Lift the room, serve practical needs and close with a settled pastoral handover.",
    requiredLinks: 7,
    missing: ["Faith & Finance edit", "Final prayer audio"],
    completed: 5,
    interactionGoal: "10 song requests · 6 dedications",
    status: "In production",
  },
] as const

const linksByHour: Record<string, LinkCard[]> = {
  "hour-1": [
    {
      id: "welcome",
      time: "09:00",
      title: "Welcome to Sundays with Adam",
      objective: "Open warmly, establish the Sunday gathering and make the first invitation into the programme.",
      energy: "Warm · assured",
      duration: "02:30",
      script: "Good morning and welcome to Sundays with Adam. It is nine o’clock, and wherever you are listening, you are part of the family this morning.",
      cta: "Send your name, location and church on WhatsApp to join today’s Roll Call.",
      reminders: "State the time and date. Smile through the first line. Keep the invitation inclusive.",
      stationRequirements: "Premier Gospel station ID · approved Sunday opener bed.",
      next: "Opening worship song",
      notes: "Hit the song vocal cleanly after one short breath.",
      ready: readinessItems,
    },
    {
      id: "roll-call",
      time: "09:10",
      title: "Sunday Show Congregation Roll Call",
      objective: "Recognise the permanent Congregation and welcome this week’s newly approved regular listeners.",
      energy: "Joyful · highly interactive",
      duration: "11:00",
      script: "The Sunday Show Congregation is gathering. We are starting with our regular family, then making room for the new names joining us this week.",
      cta: "Regulars, tell us you are present. New listeners: send your name, town and church.",
      reminders: "Read established names first. Group families naturally. Follow pronunciation notes exactly.",
      stationRequirements: "WhatsApp number once · time check after final group.",
      next: "Opening prayer",
      notes: "Four new names are waiting in the queue; one duplicate needs review.",
      ready: ["Script approved", "CTA ready", "Timing checked"],
    },
    {
      id: "reflection",
      time: "09:31",
      title: "Pastor Yvonne Reflection",
      objective: "Introduce the packaged reflection and give listeners one clear thought to carry into the week.",
      energy: "Pastoral · reflective",
      duration: "10:30",
      script: "Pastor Yvonne is with us now with a reflection for anyone learning to trust God before the answer becomes visible.",
      cta: "Send a short voice note with the line that stayed with you.",
      reminders: "Leave two seconds after the package. Respond personally, not with a second sermon.",
      stationRequirements: "Reflection audio loaded · voice-note consent reminder.",
      next: "Listener messages and voice notes",
      notes: "Final loudness check due before 08:30.",
      ready: ["Script approved", "CTA ready", "Audio loaded", "Timing checked"],
    },
  ],
  "hour-2": [
    {
      id: "school-one",
      time: "10:04",
      title: "Sunday School · Part 1",
      objective: "Set the story, name the tension and ask the audience question before the lesson develops.",
      energy: "Curious · welcoming",
      duration: "04:30",
      script: "Faith is often formed while the answer still feels far away. Today we are asking what faithful courage looks like before the breakthrough arrives.",
      cta: "Where are you being asked to trust before you can see the outcome?",
      reminders: "Keep the language accessible for every generation. Land the question before the bed rises.",
      stationRequirements: "Sunday School sting · opening sound design · no church bells.",
      next: "Song, then Sunday School Part 2",
      notes: "Page-turn texture should feel immersive but restrained.",
      ready: ["Script approved", "CTA ready", "Audio loaded", "Timing checked"],
    },
    {
      id: "school-two",
      time: "10:16",
      title: "Sunday School · Part 2",
      objective: "Reveal the golden text and connect its meaning to ordinary family, work and church life.",
      energy: "Grounded · inspirational",
      duration: "05:00",
      script: "Our golden text is Hebrews 10:23: let us hold unswervingly to the hope we profess, for he who promised is faithful.",
      cta: "Keep your answers coming — one specific situation, one sentence.",
      reminders: "Pause for two seconds after scripture. Do not rush the practical examples.",
      stationRequirements: "Warm organ texture under golden text only.",
      next: "Sunday Hotline voice note",
      notes: "Part 2 mix needs the final scripture pause.",
      ready: ["Script approved", "CTA ready", "Timing checked"],
    },
    {
      id: "school-three",
      time: "10:36",
      title: "Sunday School · Part 3",
      objective: "Resolve the lesson with one memorable phrase and one practical faithful action.",
      energy: "Hopeful · practical",
      duration: "04:45",
      script: "Faithfulness does not always feel dramatic. Sometimes it is the next honest conversation, the next prayer or the next small act of obedience.",
      cta: "What one faithful action will you take this week?",
      reminders: "Give one action and one sentence to remember. Return cleanly to listener responses.",
      stationRequirements: "Hopeful acoustic bed · tease final hour before music.",
      next: "Audience answers and final-hour preview",
      notes: "Protect the final phrase: hope is not denial; it is direction.",
      ready: readinessItems,
    },
  ],
  "hour-3": [
    {
      id: "track",
      time: "11:04",
      title: "Track of the Week",
      objective: "Introduce the station-selected track with useful artist and release context.",
      energy: "Bright · informed",
      duration: "05:30",
      script: "This week’s featured track is a reminder that hope can have rhythm. Here is the Premier Gospel Track of the Week.",
      cta: "Tell us where you were when you first heard this artist.",
      reminders: "Use supplied station copy. Confirm clean version and pronunciation.",
      stationRequirements: "Track of the Week positioning · clean radio edit.",
      next: "Weekly station liner",
      notes: "Metadata and artist pronunciation checked Friday.",
      ready: readinessItems,
    },
    {
      id: "finance",
      time: "11:23",
      title: "Faith and Finance",
      objective: "Frame the podcast extract and land one practical stewardship takeaway without giving personal advice.",
      energy: "Useful · conversational",
      duration: "14:00",
      script: "Money conversations can carry pressure, but wisdom gives us somewhere to begin. Today’s Faith and Finance looks at building a budget that reflects what matters.",
      cta: "Share the one money habit you are working on this month.",
      reminders: "Avoid personal financial advice. Keep Adam’s response under 45 seconds.",
      stationRequirements: "Premier Plus mention after package · podcast credit.",
      next: "Song requests and dedications",
      notes: "Episode 12 edit still needs final approval.",
      ready: ["Script approved", "CTA ready", "Timing checked", "Station requirement placed"],
    },
    {
      id: "prayer",
      time: "11:51",
      title: "Pastor Yvonne Final Prayer",
      objective: "Close the gathering pastorally and prepare a clean, confident handover.",
      energy: "Prayerful · settled",
      duration: "05:30",
      script: "As we bring our Sunday gathering towards a close, Pastor Yvonne is going to pray for the Congregation and the week ahead.",
      cta: "No new CTA — let the prayer land.",
      reminders: "Protect the final beat. No message reads after prayer.",
      stationRequirements: "Handover bed · Premier Gospel ID · Ibe Giantkiller name check.",
      next: "Goodbye and handover to Ibe Giantkiller",
      notes: "Final prayer audio is due Saturday at 18:00.",
      ready: ["Script approved", "CTA ready", "Timing checked", "Station requirement placed"],
    },
  ],
}

const assets = [
  { name: "Pastor Yvonne reflection", detail: "Audio · 08:42", initial: true },
  { name: "Pastor Yvonne final prayer", detail: "Audio · 05:30", initial: false },
  { name: "Sunday School package", detail: "3 parts · 14:15", initial: true },
  { name: "Faith and Finance podcast", detail: "Episode 12 · edit", initial: false },
  { name: "Track of the Week", detail: "Clean radio edit", initial: true },
  { name: "Station liners", detail: "3 approved reads", initial: true },
  { name: "Handover bed", detail: "Zetta cart 304", initial: true },
] as const

export function ProducerOSPage() {
  const [activeHour, setActiveHour] = useState("hour-1")
  const [activeLink, setActiveLink] = useState("welcome")
  const [checks, setChecks] = useState<Record<string, string[]>>(
    Object.fromEntries(Object.values(linksByHour).flat().map((link) => [link.id, [...link.ready]]))
  )
  const [checkedAssets, setCheckedAssets] = useState<string[]>(assets.filter((asset) => asset.initial).map((asset) => asset.name))
  const [uploads, setUploads] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState("")
  const profile = showProfiles["sundays-with-adam"]
  const sundaySchool = profile.sundaySchool
  const allLinks = Object.values(linksByHour).flat()
  const completeChecks = Object.values(checks).reduce((total, items) => total + items.length, 0)
  const completion = Math.round(((completeChecks + checkedAssets.length) / ((allLinks.length * readinessItems.length) + assets.length)) * 100)

  function selectHour(hour: string) {
    setActiveHour(hour)
    setActiveLink(linksByHour[hour][0].id)
  }

  function toggleCheck(linkId: string, item: string) {
    setChecks((current) => {
      const currentItems = current[linkId] ?? []
      return {
        ...current,
        [linkId]: currentItems.includes(item) ? currentItems.filter((value) => value !== item) : [...currentItems, item],
      }
    })
  }

  function toggleAsset(asset: string) {
    setCheckedAssets((current) => current.includes(asset) ? current.filter((item) => item !== asset) : [...current, asset])
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-indigo">ProducerOS · Sunday workspace</p>
          <h1 className="text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">Sundays with Adam</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />Sunday · 09:00–12:00</span>
            <span className="inline-flex items-center gap-1.5"><UserRound className="size-4" />Presenter & producer · Adam Brooks</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-11 rounded-xl bg-white" onClick={() => setNotice("Sunday production draft saved.")}>
            <Check />Save draft
          </Button>
          <Button className="primary-action h-11 rounded-xl px-5 text-white" onClick={() => setNotice("The current rundown has been sent to BroadcastOS Live.")}>
            <Radio />Send to studio
          </Button>
        </div>
      </header>

      <NowOnAirBanner />

      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success">
          <Check className="size-4" />{notice}
          <button type="button" className="ml-auto text-xs font-medium" onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}

      <Card className="soft-gradient overflow-hidden rounded-[24px] border-0 py-0 shadow-card ring-1 ring-brand-indigo/10">
        <CardContent className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Production status</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-brand-magenta" />
              <span className="text-base font-semibold">In production</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Broadcast date · Sunday 5 July</p>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Show completion</span>
              <span className="font-mono font-semibold text-brand-indigo">{completion}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-border/70">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-indigo to-brand-magenta transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">{checkedAssets.length}/{assets.length} assets · {completeChecks}/{allLinks.length * readinessItems.length} link checks</p>
          </div>
          <div className="rounded-2xl bg-ink p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Next action</p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <p className="text-sm font-medium leading-5">Approve Faith and Finance edit and load Pastor Yvonne’s final prayer.</p>
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-brand-magenta" />
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="show-hours-title">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 id="show-hours-title" className="text-base font-semibold">Three-hour show plan</h2>
            <p className="mt-1 text-xs text-muted-foreground">Purpose, readiness and interaction targets at a glance.</p>
          </div>
          <Badge variant="outline" className="hidden bg-white sm:inline-flex">21 required links</Badge>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {hours.map((hour) => (
            <button
              key={hour.id}
              type="button"
              data-testid={`hour-card-${hour.id}`}
              aria-pressed={activeHour === hour.id}
              onClick={() => selectHour(hour.id)}
              className={cn(
                "rounded-[22px] border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-indigo/25",
                activeHour === hour.id && "border-brand-indigo/25 ring-2 ring-brand-indigo/10"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("grid size-9 place-items-center rounded-xl font-mono text-xs font-semibold", activeHour === hour.id ? "bg-ink text-white" : "bg-muted text-muted-foreground")}>{hour.number}</span>
                <Badge className={hour.status === "Nearly ready" ? "bg-success-soft text-success" : "bg-brand-soft text-brand-indigo"}>{hour.status}</Badge>
              </div>
              <p className="mt-5 font-mono text-[10px] text-muted-foreground">{hour.time}</p>
              <h3 className="mt-1 text-base font-semibold">{hour.title}</h3>
              <p className="mt-3 min-h-10 text-xs leading-5 text-muted-foreground">{hour.purpose}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4 text-[10px]">
                <span><strong className="block text-sm text-foreground">{hour.completed}/{hour.requiredLinks}</strong><span className="text-muted-foreground">links complete</span></span>
                <span><strong className="block text-sm text-brand-magenta">{hour.missing.length}</strong><span className="text-muted-foreground">missing items</span></span>
              </div>
              <div className="mt-3 rounded-xl bg-muted/55 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-indigo"><Target className="size-3" />Interaction goal</p>
                <p className="mt-1.5 text-xs font-medium">{hour.interactionGoal}</p>
              </div>
              <p className="mt-3 truncate text-[10px] text-muted-foreground">Missing · {hour.missing.join(" · ")}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Link cards</h2>
              <p className="mt-1 text-xs text-muted-foreground">{hours.find((hour) => hour.id === activeHour)?.title} · detailed production view</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setNotice("A blank link card is ready to edit.")}><CirclePlus />Add link</Button>
          </div>
          {linksByHour[activeHour].map((link) => (
            <LinkEditor
              key={link.id}
              link={link}
              open={activeLink === link.id}
              checks={checks[link.id] ?? []}
              onOpen={() => setActiveLink(activeLink === link.id ? "" : link.id)}
              onToggle={(item) => toggleCheck(link.id, item)}
              onSave={() => setNotice(`${link.title} saved.`)}
            />
          ))}
          <button type="button" onClick={() => setNotice("A blank link card is ready to edit.")} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed bg-white/50 py-5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand-indigo/30 hover:text-brand-indigo">
            <CirclePlus className="size-4" />Add another link to this hour
          </button>
        </section>

        <aside className="space-y-5">
          <StationBriefPanel />

          <Card className="rounded-[22px] border-0 py-0 shadow-card ring-1 ring-border/80">
            <CardHeader className="flex flex-row items-center justify-between px-5 pb-2 pt-5">
              <div>
                <CardTitle className="text-sm">Asset checklist</CardTitle>
                <p className="mt-1 text-[10px] text-muted-foreground">Required before Sunday 08:30.</p>
              </div>
              <Badge className="bg-success-soft text-success">{checkedAssets.length}/{assets.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-1 px-5 pb-5">
              {assets.map((asset) => {
                const checked = checkedAssets.includes(asset.name)
                return (
                  <button key={asset.name} type="button" aria-pressed={checked} onClick={() => toggleAsset(asset.name)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-muted/50">
                    <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border", checked ? "border-success bg-success text-white" : "bg-white")}>{checked && <Check className="size-3" />}</span>
                    <FileAudio className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1"><span className="block text-xs font-medium">{asset.name}</span><span className="block text-[10px] text-muted-foreground">{asset.detail}</span></span>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card className="rounded-[22px] border-0 py-0 shadow-card ring-1 ring-border/80">
            <CardHeader className="px-5 pb-2 pt-5"><CardTitle className="text-sm">Production notes</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5">
              <textarea defaultValue="Keep Hour 1 warm and spacious. Protect Sunday School timings. Confirm the weekly liner before 08:30 and leave a clean two-second breath after the golden text." className="min-h-32 w-full resize-none rounded-xl border bg-muted/30 p-3 text-xs leading-5 outline-none focus:ring-2 focus:ring-ring/30" />
            </CardContent>
          </Card>

          <UploadPlaceholder id="zetta-upload" title="Zetta log screenshot" description="PNG, JPG or PDF" icon={FileImage} fileName={uploads.zetta} onFile={(name) => setUploads((current) => ({ ...current, zetta: name }))} />
          <UploadPlaceholder id="briefing-upload" title="Weekly briefing" description="PDF, DOCX or notes" icon={FileText} fileName={uploads.briefing} onFile={(name) => setUploads((current) => ({ ...current, briefing: name }))} />
        </aside>
      </div>

      <section aria-labelledby="roll-call-title">
        <div className="mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Audience production</p>
          <h2 id="roll-call-title" className="mt-1 text-base font-semibold">Roll Call Builder</h2>
        </div>
        <ProducerRollCallBuilder />
      </section>

      {sundaySchool && (
        <section aria-labelledby="sunday-school-title">
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Flagship package</p>
            <h2 id="sunday-school-title" className="mt-1 text-base font-semibold">Sunday School Production Module</h2>
          </div>
          <SundaySchoolModule module={sundaySchool} />
        </section>
      )}
    </div>
  )
}

function LinkEditor({
  link,
  open,
  checks,
  onOpen,
  onToggle,
  onSave,
}: {
  link: LinkCard
  open: boolean
  checks: string[]
  onOpen: () => void
  onToggle: (item: string) => void
  onSave: () => void
}) {
  const ready = checks.length === readinessItems.length

  return (
    <Card className={cn("overflow-hidden rounded-[22px] border-0 py-0 shadow-card ring-1 ring-border/80 transition-shadow", open && "ring-2 ring-brand-indigo/15")}>
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft font-mono text-[11px] font-semibold text-brand-indigo">{link.time}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{link.title}</span>
            {ready && <Badge className="bg-success-soft text-success">Ready</Badge>}
          </span>
          <span className="mt-1 block truncate text-xs text-muted-foreground">{link.objective}</span>
        </span>
        <Badge variant="secondary" className="hidden sm:inline-flex">{link.energy}</Badge>
        <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">{link.duration}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <CardContent className="border-t border-border/70 px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Time"><Input defaultValue={link.time} className="h-10 rounded-xl" /></Field>
            <Field label="Energy level"><Input defaultValue={link.energy} className="h-10 rounded-xl" /></Field>
            <Field label="Target duration"><Input defaultValue={link.duration} className="h-10 rounded-xl" /></Field>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Field label="Title"><Input defaultValue={link.title} className="h-10 rounded-xl" /></Field>
            <Field label="What comes next"><Input defaultValue={link.next} className="h-10 rounded-xl" /></Field>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Field label="Objective"><TextArea defaultValue={link.objective} /></Field>
            <Field label="Suggested presenter wording"><TextArea defaultValue={link.script} accent /></Field>
            <Field label="Listener CTA"><TextArea defaultValue={link.cta} /></Field>
            <Field label="Producer reminders"><TextArea defaultValue={link.reminders} /></Field>
            <Field label="Station requirements"><TextArea defaultValue={link.stationRequirements} station /></Field>
            <Field label="Optional notes"><TextArea defaultValue={link.notes} /></Field>
          </div>

          <div className="mt-5 rounded-2xl border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold"><Gauge className="size-4 text-brand-indigo" />Readiness checks</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{checks.length}/{readinessItems.length} complete</p>
              </div>
              {ready && <Badge className="bg-success-soft text-success"><Check />Ready for studio</Badge>}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {readinessItems.map((item) => {
                const checked = checks.includes(item)
                return (
                  <button key={item} type="button" aria-pressed={checked} onClick={() => onToggle(item)} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-left text-[10px] font-medium ring-1 ring-border/70">
                    <span className={cn("grid size-4 place-items-center rounded border", checked ? "border-success bg-success text-white" : "bg-white")}>{checked && <Check className="size-2.5" />}</span>
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <span className="flex items-center gap-2 text-[10px] text-muted-foreground"><Clock3 className="size-3.5" />Last edited 12:36 by Adam</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm"><MoreHorizontal />More</Button>
              <Button variant="outline" size="sm" onClick={onSave}><Check />Save link</Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}{children}</label>
}

function TextArea({ defaultValue, accent = false, station = false }: { defaultValue: string; accent?: boolean; station?: boolean }) {
  return (
    <textarea
      defaultValue={defaultValue}
      className={cn(
        "min-h-24 w-full resize-none rounded-xl border p-3 text-xs font-normal normal-case leading-5 tracking-normal text-foreground outline-none focus:ring-2 focus:ring-ring/30",
        accent ? "border-brand-indigo/15 bg-brand-soft/55" : station ? "border-amber-200 bg-amber-50/60" : "bg-white"
      )}
    />
  )
}

function UploadPlaceholder({
  id,
  title,
  description,
  icon: Icon,
  fileName,
  onFile,
}: {
  id: string
  title: string
  description: string
  icon: typeof Upload
  fileName?: string
  onFile: (name: string) => void
}) {
  return (
    <label htmlFor={id} className="block cursor-pointer rounded-[22px] border border-dashed bg-white/60 p-5 text-center shadow-sm transition-colors hover:border-brand-indigo/30 hover:bg-white">
      <input id={id} type="file" className="sr-only" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0].name)} />
      <span className="mx-auto grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Icon className="size-4" /></span>
      <span className="mt-3 block text-xs font-semibold">{title}</span>
      <span className="mt-1 block text-[10px] text-muted-foreground">{fileName || description}</span>
      <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium text-brand-indigo"><Upload className="size-3" />{fileName ? "Replace file" : "Choose file"}</span>
    </label>
  )
}
