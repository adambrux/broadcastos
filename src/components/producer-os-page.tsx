"use client"

import { useState } from "react"
import {
  AudioLines,
  CalendarDays,
  Check,
  ChevronDown,
  CirclePlus,
  Clock3,
  FileAudio,
  FileImage,
  FileText,
  Headphones,
  ListMusic,
  MessageSquareText,
  Mic2,
  MoreHorizontal,
  Plus,
  Radio,
  Sparkles,
  Upload,
  UserRound,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  next: string
  notes: string
}

const hours = [
  { id: "hour-1", time: "09:00–10:00", title: "Welcome & Congregation", links: 7, status: "Ready" },
  { id: "hour-2", time: "10:00–11:00", title: "Sunday School", links: 7, status: "In progress" },
  { id: "hour-3", time: "11:00–12:00", title: "Music, Life & Prayer", links: 7, status: "Draft" },
] as const

const linksByHour: Record<string, LinkCard[]> = {
  "hour-1": [
    {
      id: "welcome",
      time: "09:00",
      title: "Welcome to Sundays with Adam",
      objective: "Open the programme warmly, establish the Sunday gathering and invite listeners into the morning.",
      energy: "Warm · assured",
      duration: "02:30",
      script: "Good morning and welcome to Sundays with Adam. It is nine o’clock on Sunday 6 July, and wherever you are listening, you are part of the family this morning.",
      cta: "Send your name, location and church on WhatsApp to join today’s roll call.",
      reminders: "State the time and date. Smile through the first line. Keep the invitation inclusive.",
      next: "Opening worship song",
      notes: "Use the approved Sunday opener bed and hit the vocal cleanly.",
    },
    {
      id: "roll-call",
      time: "09:10",
      title: "Sunday Show Congregation Roll Call",
      objective: "Recognise the permanent congregation and welcome new regular listeners into the community.",
      energy: "Joyful · highly interactive",
      duration: "11:00",
      script: "The Sunday Show Congregation is gathering. We are starting with our regular family, then making room for the new names joining us today.",
      cta: "Message your name, town and church; regulars, let us know you are present.",
      reminders: "Everyone remains on the cumulative list. Read new additions after established names.",
      next: "Opening prayer",
      notes: "New Listener Queue has four candidates ready for approval.",
    },
    {
      id: "reflection",
      time: "09:31",
      title: "Pastor Yvonne Reflection",
      objective: "Introduce the packaged reflection and give listeners one clear thought to carry forward.",
      energy: "Pastoral · reflective",
      duration: "10:30",
      script: "Pastor Yvonne is with us now with a reflection for anyone learning to trust God before the answer becomes visible.",
      cta: "Send a short voice note with the line that stayed with you.",
      reminders: "Leave two seconds after the package. Respond personally, not with a second sermon.",
      next: "Listener voice notes",
      notes: "Audio approved at 08:42. Check final loudness before loading.",
    },
  ],
  "hour-2": [
    {
      id: "school-one",
      time: "10:04",
      title: "Sunday School · Part 1",
      objective: "Set the scene, introduce the lesson and open the audience question.",
      energy: "Curious · welcoming",
      duration: "04:30",
      script: "Faith is often formed while the answer still feels far away. Today we are asking what faithful courage looks like before the breakthrough arrives.",
      cta: "Where are you being asked to trust before you can see the outcome?",
      reminders: "Keep the language accessible for every generation. Land the question before the bed rises.",
      next: "Song, then Sunday School Part 2",
      notes: "Page-turn texture at open; no church bells.",
    },
    {
      id: "school-two",
      time: "10:16",
      title: "Sunday School · Part 2",
      objective: "Reveal the golden text and connect its meaning to ordinary life.",
      energy: "Grounded · inspirational",
      duration: "05:00",
      script: "Our golden text is Hebrews 10:23: let us hold unswervingly to the hope we profess, for he who promised is faithful.",
      cta: "Keep your answers coming — one specific situation, one sentence.",
      reminders: "Pause for two seconds after the scripture. Do not rush the practical examples.",
      next: "Sunday Hotline voice note",
      notes: "Warm organ texture under the golden text only.",
    },
    {
      id: "school-three",
      time: "10:36",
      title: "Sunday School · Part 3",
      objective: "Resolve the lesson with one practical action for the week ahead.",
      energy: "Hopeful · practical",
      duration: "04:45",
      script: "Faithfulness does not always feel dramatic. Sometimes it is the next honest conversation, the next prayer or the next small act of obedience.",
      cta: "What one faithful action will you take this week?",
      reminders: "Give one action and one sentence to remember. Return cleanly to listener responses.",
      next: "Audience answers and final-hour preview",
      notes: "Use the hopeful acoustic bed from Sunday School pack v3.",
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
      next: "Weekly station liner",
      notes: "Final track supplied Friday; metadata checked.",
    },
    {
      id: "finance",
      time: "11:23",
      title: "Faith and Finance",
      objective: "Frame the podcast extract and land one practical stewardship takeaway.",
      energy: "Useful · conversational",
      duration: "14:00",
      script: "Money conversations can carry pressure, but wisdom gives us somewhere to begin. Today’s Faith and Finance looks at building a budget that reflects what matters.",
      cta: "Share the one money habit you are working on this month.",
      reminders: "Avoid personal financial advice. Keep Adam’s response under 45 seconds.",
      next: "Song requests and dedications",
      notes: "Episode 12 edit still needs final review.",
    },
    {
      id: "prayer",
      time: "11:51",
      title: "Pastor Yvonne Prayer",
      objective: "Close the gathering pastorally and prepare a clean handover.",
      energy: "Prayerful · settled",
      duration: "05:30",
      script: "As we bring our Sunday gathering towards a close, Pastor Yvonne is going to pray for the congregation and the week ahead.",
      cta: "No new CTA — let the prayer land.",
      reminders: "Protect the final beat. No message reads after prayer.",
      next: "Goodbye and handover to Ibe Giantkiller",
      notes: "Handover bed loaded in Zetta cart 304.",
    },
  ],
}

const featureBlocks = [
  { title: "Congregation Roll Call", meta: "Permanent · cumulative", icon: Users, colour: "text-brand-indigo bg-brand-soft" },
  { title: "Pastor Yvonne Reflection", meta: "Audio · 08:42", icon: Mic2, colour: "text-brand-magenta bg-pink-50" },
  { title: "Sunday School", meta: "3 packaged parts", icon: Sparkles, colour: "text-brand-violet bg-purple-50" },
  { title: "Track of the Week", meta: "Station supplied", icon: ListMusic, colour: "text-success bg-success-soft" },
  { title: "Faith and Finance", meta: "Podcast · episode 12", icon: Headphones, colour: "text-amber-700 bg-amber-50" },
] as const

const audioAssets = [
  "Sunday opener v4",
  "Pastor Yvonne reflection",
  "Sunday School parts 1–3",
  "Track of the Week",
  "Faith and Finance episode 12",
  "Ibe Giantkiller handover bed",
]

export function ProducerOSPage() {
  const [activeHour, setActiveHour] = useState("hour-1")
  const [activeLink, setActiveLink] = useState("welcome")
  const [checkedAssets, setCheckedAssets] = useState(audioAssets.slice(0, 4))
  const [uploads, setUploads] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState("")
  const activeLinks = linksByHour[activeHour]

  function selectHour(hour: string) {
    setActiveHour(hour)
    setActiveLink(linksByHour[hour][0].id)
  }

  function toggleAsset(asset: string) {
    setCheckedAssets((current) => current.includes(asset) ? current.filter((item) => item !== asset) : [...current, asset])
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-indigo">Production desk</p>
          <h1 className="text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">ProducerOS</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">Build the show hour by hour, then send a clean running order into the studio.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-11 rounded-xl bg-white" onClick={() => setNotice("Draft saved at 12:42")}>
            <Check /> Save draft
          </Button>
          <Button className="primary-action h-11 rounded-xl px-5 text-white" onClick={() => setNotice("Rundown is ready for BroadcastOS Live")}>
            <Radio /> Send to studio
          </Button>
        </div>
      </header>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success">
          <Check className="size-4" />{notice}
          <button type="button" className="ml-auto text-xs font-medium" onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}

      <Card className="soft-gradient rounded-[22px] border-brand-indigo/10 py-0 shadow-card">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_230px_auto] lg:items-end">
          <label className="space-y-2 text-xs font-medium">
            <span className="flex items-center gap-2 text-muted-foreground"><AudioLines className="size-3.5" />Show</span>
            <select className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" defaultValue="sundays">
              <option value="sundays">Sundays with Adam</option>
              <option value="afternoons">Afternoons with Adam</option>
              <option value="saturday">Saturday Breakfast</option>
            </select>
          </label>
          <label className="space-y-2 text-xs font-medium">
            <span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-3.5" />Broadcast date</span>
            <Input type="date" defaultValue="2026-07-06" className="h-11 rounded-xl bg-white" />
          </label>
          <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
            <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand-indigo"><UserRound className="size-4" /></span>
            <span><span className="block text-xs font-medium">Adam Brooks</span><span className="text-[10px] text-muted-foreground">Presenter & producer</span></span>
          </div>
        </CardContent>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Show hours</h2>
            <p className="mt-1 text-xs text-muted-foreground">Select an hour to edit its links.</p>
          </div>
          <Badge variant="outline">Sunday · 09:00–12:00</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {hours.map((hour, index) => (
            <button
              key={hour.id}
              type="button"
              onClick={() => selectHour(hour.id)}
              className={cn("rounded-2xl border p-5 text-left shadow-sm transition-all", activeHour === hour.id ? "border-brand-indigo/30 bg-white ring-2 ring-brand-indigo/10" : "bg-white/70 hover:border-brand-indigo/20")}
            >
              <div className="flex items-center justify-between">
                <span className={cn("grid size-8 place-items-center rounded-lg text-xs font-semibold", activeHour === hour.id ? "bg-brand-indigo text-white" : "bg-muted text-muted-foreground")}>{index + 1}</span>
                <Badge className={cn("text-[9px]", hour.status === "Ready" ? "bg-success-soft text-success" : hour.status === "In progress" ? "bg-brand-soft text-brand-indigo" : "bg-muted text-muted-foreground")}>{hour.status}</Badge>
              </div>
              <p className="mt-5 font-mono text-[10px] text-muted-foreground">{hour.time}</p>
              <h3 className="mt-1 text-sm font-semibold">{hour.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground">{hour.links} scheduled links</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Link cards</h2>
              <p className="mt-1 text-xs text-muted-foreground">{hours.find((hour) => hour.id === activeHour)?.title}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setNotice("A blank link card has been added to this hour")}><Plus /> Add link</Button>
          </div>
          {activeLinks.map((link) => (
            <LinkEditor
              key={link.id}
              link={link}
              open={activeLink === link.id}
              onOpen={() => setActiveLink(activeLink === link.id ? "" : link.id)}
            />
          ))}
          <button type="button" onClick={() => setNotice("A blank link card has been added to this hour")} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed bg-white/50 py-5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand-indigo/30 hover:text-brand-indigo">
            <CirclePlus className="size-4" />Add another link to this hour
          </button>
        </section>

        <aside className="space-y-5">
          <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
            <CardHeader className="flex flex-row items-center justify-between px-5 pb-2 pt-5">
              <CardTitle className="text-sm">Feature blocks</CardTitle>
              <Button variant="ghost" size="icon-sm" aria-label="Add feature"><Plus /></Button>
            </CardHeader>
            <CardContent className="space-y-2 px-5 pb-5">
              {featureBlocks.map(({ title, meta, icon: Icon, colour }) => (
                <button key={title} type="button" onClick={() => setNotice(`${title} is ready to place in the rundown`)} className="flex w-full items-center gap-3 rounded-xl border bg-white p-3 text-left transition-colors hover:bg-muted/40">
                  <span className={cn("grid size-9 place-items-center rounded-lg", colour)}><Icon className="size-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-xs font-medium">{title}</span><span className="text-[10px] text-muted-foreground">{meta}</span></span>
                  <Plus className="size-3.5 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>

          <EditorialCard
            icon={Radio}
            title="Station liners"
            items={["Weekly briefing liner · 11:19", "Premier Gospel station ID", "Ibe Giantkiller handover"]}
          />
          <EditorialCard
            icon={Sparkles}
            title="Prayer points"
            items={["Families beginning a difficult week", "Listeners waiting for an answer", "Churches and community leaders"]}
          />
          <EditorialCard
            icon={Mic2}
            title="Guest section"
            items={["Pastor Yvonne", "Reflection approved · 08:42", "Final prayer · 11:51"]}
          />
          <EditorialCard
            icon={MessageSquareText}
            title="Listener interaction"
            items={["Roll Call: 1,284 regulars", "New Listener Queue: 4", "Voice notes selected: 6"]}
          />

          <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
            <CardHeader className="px-5 pb-2 pt-5"><CardTitle className="text-sm">Production notes</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5">
              <textarea
                defaultValue="Keep Hour 1 warm and spacious. Protect Sunday School timings. Confirm the weekly liner before 08:30 and leave a clean two-second breath after the golden text."
                className="min-h-32 w-full resize-none rounded-xl border bg-muted/30 p-3 text-xs leading-5 outline-none focus:ring-2 focus:ring-ring/30"
              />
            </CardContent>
          </Card>

          <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
            <CardHeader className="flex flex-row items-center justify-between px-5 pb-2 pt-5">
              <CardTitle className="text-sm">Audio asset checklist</CardTitle>
              <Badge className="bg-success-soft text-success">{checkedAssets.length}/{audioAssets.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-1 px-5 pb-5">
              {audioAssets.map((asset) => {
                const checked = checkedAssets.includes(asset)
                return (
                  <button key={asset} type="button" onClick={() => toggleAsset(asset)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted/50">
                    <span className={cn("grid size-5 place-items-center rounded-md border", checked ? "border-success bg-success text-white" : "bg-white")}>{checked && <Check className="size-3" />}</span>
                    <FileAudio className="size-3.5 text-muted-foreground" />
                    <span className="flex-1 text-xs">{asset}</span>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <UploadPlaceholder
            id="zetta-upload"
            title="Zetta log screenshot"
            description="PNG, JPG or PDF"
            icon={FileImage}
            fileName={uploads.zetta}
            onFile={(name) => setUploads((current) => ({ ...current, zetta: name }))}
          />
          <UploadPlaceholder
            id="briefing-upload"
            title="Weekly briefing"
            description="PDF, DOCX or notes"
            icon={FileText}
            fileName={uploads.briefing}
            onFile={(name) => setUploads((current) => ({ ...current, briefing: name }))}
          />
        </aside>
      </div>
    </div>
  )
}

function LinkEditor({ link, open, onOpen }: { link: LinkCard; open: boolean; onOpen: () => void }) {
  return (
    <Card className={cn("overflow-hidden rounded-[22px] py-0 shadow-card ring-border/80 transition-shadow", open && "ring-brand-indigo/20")}>
      <button type="button" onClick={onOpen} className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft font-mono text-[11px] font-semibold text-brand-indigo">{link.time}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{link.title}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{link.objective}</span>
        </span>
        <Badge variant="secondary" className="hidden sm:inline-flex">{link.energy}</Badge>
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
            <Field label="Suggested script"><TextArea defaultValue={link.script} accent /></Field>
            <Field label="Listener CTA"><TextArea defaultValue={link.cta} /></Field>
            <Field label="Producer reminders"><TextArea defaultValue={link.reminders} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Optional notes"><TextArea defaultValue={link.notes} /></Field>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <span className="flex items-center gap-2 text-[10px] text-muted-foreground"><Clock3 className="size-3.5" />Last edited 12:36 by Adam</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm"><MoreHorizontal /> More</Button>
              <Button variant="outline" size="sm"><Check /> Save link</Button>
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

function TextArea({ defaultValue, accent = false }: { defaultValue: string; accent?: boolean }) {
  return <textarea defaultValue={defaultValue} className={cn("min-h-24 w-full resize-none rounded-xl border p-3 text-xs font-normal normal-case leading-5 tracking-normal text-foreground outline-none focus:ring-2 focus:ring-ring/30", accent ? "border-brand-indigo/15 bg-brand-soft/55" : "bg-white")} />
}

function EditorialCard({ icon: Icon, title, items }: { icon: typeof Radio; title: string; items: string[] }) {
  return (
    <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
      <CardHeader className="flex flex-row items-center justify-between px-5 pb-2 pt-5">
        <CardTitle className="flex items-center gap-2 text-sm"><Icon className="size-4 text-brand-indigo" />{title}</CardTitle>
        <Button variant="ghost" size="icon-sm" aria-label={`Add ${title}`}><Plus /></Button>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="divide-y divide-border/70">
          {items.map((item) => <div key={item} className="flex items-center gap-2 py-2.5 text-xs"><span className="size-1.5 rounded-full bg-brand-indigo" />{item}</div>)}
        </div>
      </CardContent>
    </Card>
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
