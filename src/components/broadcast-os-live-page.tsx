"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Headphones,
  MessageSquarePlus,
  MessageSquareText,
  Mic2,
  Pause,
  Radio,
  SkipForward,
  Sparkles,
  Timer,
  UserRoundPlus,
  Users,
  WandSparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { showProfiles } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type ListenerCue = {
  kind: "WhatsApp" | "Text" | "Voice note" | "Congregation" | "New listener"
  name: string
  location: string
  message: string
}

type LiveDetail = {
  orderTitle: string
  outOf: string
  duration: string
  energy: string
  script: string
  cta: string
  producer: string
  station: string
  urgent?: string
  listeners: readonly ListenerCue[]
}

const sundayProfile = showProfiles["sundays-with-adam"]
const sundayOrder = sundayProfile.runningOrder

const generalListeners: readonly ListenerCue[] = [
  { kind: "WhatsApp", name: "Michelle", location: "Croydon", message: "Listening with the Grant family — we are ready for Sunday School." },
  { kind: "Text", name: "David", location: "Manchester", message: "Please pray for families waiting on difficult news this week." },
  { kind: "Voice note", name: "Ruth", location: "Enfield", message: "00:18 · Trusting while the answer is still delayed." },
  { kind: "Congregation", name: "Pastor Samuel & Grace", location: "Peckham", message: "Mention with the Adebayo family group." },
  { kind: "New listener", name: "Marcia Williams", location: "Croydon", message: "Welcome this week · pronunciation: MAR-see-ah." },
]

const liveDetails: readonly LiveDetail[] = [
  {
    orderTitle: "Welcome",
    outOf: "Sunday opener bed",
    duration: "02:30",
    energy: "Warm · assured",
    script: "Good morning and welcome to Sundays with Adam. It is nine o’clock, and wherever you are listening, you are part of the family this morning.",
    cta: "Send your name, location and church on WhatsApp to join today’s Roll Call.",
    producer: "State the time and date, smile through the invitation, then hit the opening song vocal cleanly.",
    station: "Premier Gospel station ID · approved Sunday opener.",
    listeners: generalListeners.slice(0, 2),
  },
  {
    orderTitle: "Sunday Show Congregation Roll Call",
    outOf: "Opening worship song",
    duration: "11:00",
    energy: "Joyful · highly interactive",
    script: "The Sunday Show Congregation is gathering. We are starting with our regular family, then making room for the new names joining us today. Wherever you are listening from, you are part of this.",
    cta: "Regulars, tell us you are present. New listeners: send your name, town and church.",
    producer: "Read established names first, follow pronunciation notes, then welcome this week’s approved additions.",
    station: "Mention WhatsApp number once · time check before prayer.",
    urgent: "Welcome Marcia as a new regular before the final family group.",
    listeners: generalListeners,
  },
  {
    orderTitle: "Pastor Yvonne reflection",
    outOf: "Reflective song",
    duration: "10:30",
    energy: "Pastoral · reflective",
    script: "Pastor Yvonne is with us now with a reflection for anyone learning to trust God before the answer becomes visible.",
    cta: "Send a short voice note with the line that stayed with you.",
    producer: "Package duration 08:42. Leave two seconds at the end, then respond personally rather than adding a second sermon.",
    station: "Voice-note consent reminder · Sunday station liner after responses.",
    listeners: generalListeners.slice(1, 5),
  },
  {
    orderTitle: "Sunday School · Part 1",
    outOf: "Sunday School sting",
    duration: "04:30",
    energy: "Curious · welcoming",
    script: "Faith is often formed while the answer still feels far away. Today we are asking what faithful courage looks like before the breakthrough arrives.",
    cta: "Where are you being asked to trust before you can see the outcome?",
    producer: "Land the question before the bed rises. Keep the language accessible for every generation.",
    station: "Sunday School positioning · no station liner inside the package.",
    listeners: generalListeners.slice(0, 4),
  },
  {
    orderTitle: "Sunday School · Part 2",
    outOf: "Song after Part 1",
    duration: "05:00",
    energy: "Grounded · inspirational",
    script: "Our golden text is Hebrews 10:23: let us hold unswervingly to the hope we profess, for he who promised is faithful.",
    cta: "Keep your answers coming — one specific situation, one sentence.",
    producer: "Pause for two seconds after scripture. Do not rush the practical examples.",
    station: "Warm organ texture under the golden text only.",
    urgent: "Protect the clean two-second pause after the golden text.",
    listeners: generalListeners.slice(1, 4),
  },
  {
    orderTitle: "Sunday School · Part 3",
    outOf: "Sunday Hotline voice note",
    duration: "04:45",
    energy: "Hopeful · practical",
    script: "Faithfulness does not always feel dramatic. Sometimes it is the next honest conversation, the next prayer or the next small act of obedience.",
    cta: "What one faithful action will you take this week?",
    producer: "Give one action and one sentence to remember. Return cleanly to listener responses.",
    station: "Hopeful acoustic bed · tease the final hour before music.",
    listeners: generalListeners,
  },
  {
    orderTitle: "Track of the Week",
    outOf: "Final-hour reintroduction",
    duration: "05:30",
    energy: "Bright · informed",
    script: "This week’s featured track is a reminder that hope can have rhythm. Here is the Premier Gospel Track of the Week.",
    cta: "Tell us where you were when you first heard this artist.",
    producer: "Use supplied artist copy and pronounce the title exactly as marked in the station brief.",
    station: "Track of the Week positioning · clean radio edit.",
    listeners: generalListeners.slice(0, 3),
  },
  {
    orderTitle: "Faith and Finance podcast",
    outOf: "Weekly station liner",
    duration: "14:00",
    energy: "Useful · conversational",
    script: "Money conversations can carry pressure, but wisdom gives us somewhere to begin. Today’s Faith and Finance looks at building a budget that reflects what matters.",
    cta: "Share the one money habit you are working on this month.",
    producer: "Avoid personal financial advice. Keep your response after the package under 45 seconds.",
    station: "Credit Faith and Finance · mention Premier Plus after the package.",
    urgent: "Do not place another CTA beside the Premier Plus mention.",
    listeners: generalListeners.slice(0, 4),
  },
  {
    orderTitle: "Pastor Yvonne prayer",
    outOf: "Final song request",
    duration: "05:30",
    energy: "Prayerful · settled",
    script: "As we bring our Sunday gathering towards a close, Pastor Yvonne is going to pray for the Congregation and the week ahead.",
    cta: "No new CTA — let the prayer land.",
    producer: "Protect the final beat. No listener messages after the prayer.",
    station: "Premier Gospel ID · handover bed ready · Ibe Giantkiller name check.",
    listeners: generalListeners.slice(1, 5),
  },
  {
    orderTitle: "Goodbye & handover",
    outOf: "Pastor Yvonne final prayer",
    duration: "01:30",
    energy: "Grateful · clean",
    script: "Thank you for being part of the Sunday Show Congregation. I’m Adam Brooks, and Ibe Giantkiller is ready to carry you into the rest of Sunday here on Premier Gospel.",
    cta: "No new CTA — thank the Congregation and hand over.",
    producer: "Hit Ibe’s name cleanly, keep the goodbye concise and protect the network join.",
    station: "Premier Gospel ID · Ibe Giantkiller handover bed.",
    urgent: "Hard out at 12:00:00.",
    listeners: generalListeners.slice(0, 2),
  },
] as const

const liveItems = liveDetails.map((detail) => {
  const orderIndex = sundayOrder.findIndex((item) => item.title === detail.orderTitle)
  const order = sundayOrder[orderIndex]
  return {
    ...detail,
    title: order.title,
    time: order.time,
    objective: order.note,
    itemNumber: orderIndex + 1,
  }
})

const trackingChecks = [
  "Read WhatsApp",
  "Read text",
  "Played voice note",
  "Mentioned WhatsApp number",
  "Mentioned text number",
  "Time check",
  "Station ID",
  "Teased ahead",
  "Prayed",
  "Mentioned Premier Plus",
  "Used station liner",
  "Mentioned Sunday Show Congregation",
] as const

const fillerOptions = [
  { title: "Quick prayer", icon: Sparkles, text: "Father, meet every listener exactly where they are today. Bring peace, wisdom and fresh hope for the next step. Amen." },
  { title: "Quick WhatsApp CTA", icon: MessageSquareText, text: "You are part of the conversation — send your name, location and one-line response on WhatsApp now." },
  { title: "Quick station ID", icon: Radio, text: "This is Premier Gospel — music and conversation to strengthen your faith." },
  { title: "Quick tease ahead", icon: ArrowRight, text: "Stay with us. In just a moment, we have more from the Sunday Show Congregation and something practical for the week ahead." },
  { title: "Quick listener shoutout", icon: Users, text: "A big Sunday welcome to everybody listening at home, at work, on the road and gathering with family this morning." },
  { title: "Quick encouragement", icon: WandSparkles, text: "You do not need the whole map to take the next faithful step. Grace is already waiting for you there." },
] as const

function getHour(time: string) {
  const hour = Number(time.slice(0, 2))
  if (hour < 10) return "Hour 1 · Welcome & Congregation"
  if (hour < 11) return "Hour 2 · Sunday School"
  return "Hour 3 · Music, Life & Prayer"
}

export function BroadcastOSLivePage() {
  const [clock, setClock] = useState("--:--:--")
  const [activeIndex, setActiveIndex] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const [skipped, setSkipped] = useState<number[]>([])
  const [tracking, setTracking] = useState<Record<number, string[]>>({})
  const [noteOpen, setNoteOpen] = useState(false)
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [fillerOpen, setFillerOpen] = useState(false)
  const [selectedFiller, setSelectedFiller] = useState(0)
  const [notice, setNotice] = useState("")
  const item = liveItems[activeIndex]
  const nextItem = liveItems[activeIndex + 1]
  const itemChecks = tracking[activeIndex] ?? []
  const progress = (item.itemNumber / sundayOrder.length) * 100

  useEffect(() => {
    function updateClock() {
      setClock(new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date()))
    }
    updateClock()
    const timer = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(timer)
  }, [])

  function toggleCheck(label: string) {
    setTracking((current) => {
      const currentChecks = current[activeIndex] ?? []
      return {
        ...current,
        [activeIndex]: currentChecks.includes(label)
          ? currentChecks.filter((check) => check !== label)
          : [...currentChecks, label],
      }
    })
  }

  function move(direction: -1 | 1) {
    setActiveIndex((current) => Math.min(liveItems.length - 1, Math.max(0, current + direction)))
    setNoteOpen(false)
    setNotice("")
  }

  function markDone() {
    setCompleted((current) => current.includes(activeIndex) ? current : [...current, activeIndex])
    setNotice(`${item.title} marked complete.`)
    if (activeIndex < liveItems.length - 1) setActiveIndex((current) => current + 1)
  }

  function skipItem() {
    setSkipped((current) => current.includes(activeIndex) ? current : [...current, activeIndex])
    setNotice(`${item.title} skipped.`)
    if (activeIndex < liveItems.length - 1) setActiveIndex((current) => current + 1)
  }

  return (
    <div className="fixed inset-0 z-[45] overflow-auto bg-[#08090d] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08090d]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-5 py-3 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-ink">
                <Radio className="size-5" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-red-500" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">Sundays with Adam</p>
                  <Badge className="bg-red-500/15 text-[9px] text-red-300 hover:bg-red-500/15">LIVE</Badge>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-white/45">{getHour(item.time)}</p>
              </div>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              <div className="text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">Current item</p>
                <p className="mt-1 font-mono text-sm font-semibold">{item.itemNumber} / {sundayOrder.length}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-3xl font-semibold tracking-[-0.04em]">{clock}</p>
                <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">Sunday 5 July</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right md:hidden">
                <p className="font-mono text-lg font-semibold">{clock.slice(0, 5)}</p>
                <p className="text-[9px] text-white/35">{item.itemNumber}/{sundayOrder.length}</p>
              </div>
              <Button variant="outline" size="sm" asChild className="h-9 rounded-xl border-white/15 bg-white/[0.06] px-3 text-white hover:bg-white/10 hover:text-white">
                <Link href="/dashboard" aria-label="Exit Broadcast Mode and return to dashboard">
                  <ArrowLeft />
                  <span className="hidden sm:inline">Exit Broadcast Mode</span>
                  <span className="sm:hidden">Exit</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="h-1 bg-white/[0.06]">
          <div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 pb-28 pt-4 sm:px-8">
        {notice && (
          <div role="status" className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="size-4" />{notice}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]">
          <section className="min-w-0 space-y-3">
            <article className="rounded-[24px] bg-white p-5 text-ink shadow-[0_20px_70px_rgba(0,0,0,.3)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-ink/40">Current item · {item.time}</p>
                  <h1 className="mt-2 text-[28px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[36px]">{item.title}</h1>
                </div>
                <span className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600"><span className="size-1.5 rounded-full bg-red-500" />On air</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Meta label="Out of" value={item.outOf} />
                <Meta label="Target" value={item.duration} icon={Timer} />
                <Meta label="Energy" value={item.energy} icon={Sparkles} />
              </div>
              <div className="mt-5 border-t pt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Link objective</p>
                <p className="mt-2 text-base font-medium leading-6 sm:text-lg">{item.objective}</p>
              </div>
            </article>

            <article className="rounded-[24px] border border-violet-400/20 bg-gradient-to-br from-violet-500/16 to-white/[0.035] p-5 shadow-[0_18px_60px_rgba(0,0,0,.24)] sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-violet-300">Suggested presenter wording</p>
                <Headphones className="size-4 text-violet-300" />
              </div>
              <blockquote className="mt-4 text-[22px] font-medium leading-[1.45] tracking-[-0.018em] sm:text-[27px]">
                “{item.script}”
              </blockquote>
            </article>

            <div className="grid gap-3 md:grid-cols-3">
              <CueCard label="Key CTA" value={item.cta} icon={MessageSquareText} accent />
              <CueCard label="Producer reminder" value={item.producer} icon={Mic2} />
              <CueCard label="Station requirement" value={item.station} icon={Radio} />
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-violet-300"><ChevronRight className="size-4" /></span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">What comes next</p>
                  <p className="mt-1.5 text-base font-semibold">{nextItem?.title ?? "End of show"}</p>
                  <p className="mt-1 text-xs text-white/45">{nextItem ? `${nextItem.time} · ${nextItem.objective}` : "Clean handover complete."}</p>
                </div>
              </div>
            </div>

            {noteOpen && (
              <div className="rounded-[20px] border border-violet-400/20 bg-violet-400/10 p-4">
                <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300" htmlFor="live-note">Presenter note</label>
                <textarea
                  id="live-note"
                  value={notes[activeIndex] ?? ""}
                  onChange={(event) => setNotes((current) => ({ ...current, [activeIndex]: event.target.value }))}
                  placeholder="Add one short note for this link…"
                  rows={3}
                  className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-violet-300/40"
                />
              </div>
            )}
          </section>

          <aside className="space-y-3">
            <section className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_60px_rgba(0,0,0,.2)]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Next item</p>
                <span className="font-mono text-xs text-white/40">{nextItem?.time ?? "12:00"}</span>
              </div>
              <p className="mt-2 text-lg font-semibold">{nextItem?.title ?? "Show complete"}</p>
              <p className="mt-2 text-xs leading-5 text-white/55">{nextItem?.objective ?? "Thank the Congregation and complete the handover."}</p>
              {nextItem?.urgent && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/15 bg-amber-300/10 p-3 text-xs leading-5 text-amber-200">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{nextItem.urgent}
                </div>
              )}
            </section>

            <section className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_60px_rgba(0,0,0,.2)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold"><MessageSquareText className="size-4 text-violet-300" />Selected listeners</h2>
                  <p className="mt-1 text-[10px] text-white/40">Use only what fits this link.</p>
                </div>
                <Badge variant="outline" className="border-white/15 text-white">{item.listeners.length}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {item.listeners.map((listener) => (
                  <article key={`${listener.kind}-${listener.name}`} className="rounded-xl border border-white/[0.08] bg-black/15 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <ListenerBadge kind={listener.kind} />
                      <p className="text-xs font-semibold">{listener.name}</p>
                      <span className="text-[10px] text-white/35">{listener.location}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/65">{listener.message}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_60px_rgba(0,0,0,.2)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold">Live tracking</h2>
                  <p className="mt-1 text-[10px] text-white/40">For this link only.</p>
                </div>
                <Badge variant="outline" className="border-white/15 text-white">{itemChecks.length}/{trackingChecks.length}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {trackingChecks.map((label) => {
                  const checked = itemChecks.includes(label)
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleCheck(label)}
                      aria-pressed={checked}
                      className={cn(
                        "flex min-h-11 items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[10px] font-medium leading-4 transition-colors",
                        checked ? "border-emerald-400/25 bg-emerald-400/15 text-emerald-300" : "border-white/10 bg-white/[0.03] text-white/65 hover:border-violet-300/30"
                      )}
                    >
                      <span className={cn("grid size-4 shrink-0 place-items-center rounded border", checked ? "border-emerald-400 bg-emerald-400 text-emerald-950" : "border-white/20")}>
                        {checked && <Check className="size-2.5" />}
                      </span>
                      {label}
                    </button>
                  )
                })}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#08090d]/96 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-2">
          <Button variant="outline" size="lg" onClick={() => move(-1)} disabled={activeIndex === 0} aria-label="Previous" className="h-11 rounded-xl border-white/15 bg-white/[0.06] px-3 text-white hover:bg-white/10 hover:text-white disabled:text-white/20 lg:px-5">
            <ArrowLeft /><span className="hidden lg:inline">Previous</span>
          </Button>
          <div className="hidden items-center gap-1.5 lg:flex">
            {liveItems.map((link, index) => (
              <span key={link.orderTitle} className={cn("h-1.5 rounded-full transition-all", index === activeIndex ? "w-7 bg-violet-300" : completed.includes(index) ? "w-2.5 bg-emerald-400" : skipped.includes(index) ? "w-2.5 bg-amber-300" : "w-2.5 bg-white/15")} />
            ))}
          </div>
          <Button variant="ghost" size="lg" onClick={skipItem} aria-label="Skip item" className="h-11 rounded-xl px-3 text-white/55 hover:bg-white/[0.06] hover:text-white">
            <SkipForward /><span className="hidden lg:inline">Skip item</span>
          </Button>
          <Button size="lg" onClick={markDone} className="h-11 rounded-xl bg-white px-4 text-ink hover:bg-white/90 sm:px-7">
            <CheckCircle2 />Mark Done
          </Button>
          <Button variant="ghost" size="lg" onClick={() => setNoteOpen((current) => !current)} aria-label="Add note" aria-pressed={noteOpen} className="h-11 rounded-xl px-3 text-white/65 hover:bg-white/[0.06] hover:text-white">
            <MessageSquarePlus /><span className="hidden lg:inline">Add note</span>
          </Button>
          <Sheet open={fillerOpen} onOpenChange={setFillerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" aria-label="Emergency filler" className="h-11 rounded-xl border-amber-300/20 bg-amber-300/10 px-3 text-amber-200 hover:bg-amber-300/15 hover:text-amber-100">
                <Pause /><span className="hidden lg:inline">Emergency filler</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full border-white/10 bg-[#101116] text-white sm:max-w-lg" side="right">
              <SheetHeader className="border-b border-white/10 p-6">
                <SheetTitle className="flex items-center gap-2 text-xl text-white"><Pause className="size-5 text-amber-300" />Emergency filler</SheetTitle>
                <SheetDescription className="text-white/45">Short, safe options Adam can use immediately if timing changes.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-auto p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {fillerOptions.map((option, index) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.title}
                        type="button"
                        onClick={() => setSelectedFiller(index)}
                        aria-pressed={selectedFiller === index}
                        className={cn("rounded-2xl border p-4 text-left transition-colors", selectedFiller === index ? "border-amber-300/30 bg-amber-300/10" : "border-white/10 bg-white/[0.035] hover:border-white/20")}
                      >
                        <Icon className={cn("size-4", selectedFiller === index ? "text-amber-300" : "text-white/45")} />
                        <p className="mt-3 text-sm font-semibold">{option.title}</p>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 rounded-[22px] border border-amber-300/20 bg-amber-300/10 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300">Ready to read</p>
                  <p className="mt-3 text-xl font-medium leading-8">“{fillerOptions[selectedFiller].text}”</p>
                </div>
                <Button
                  className="mt-4 h-11 w-full rounded-xl bg-white text-ink hover:bg-white/90"
                  onClick={() => {
                    setNotice(`${fillerOptions[selectedFiller].title} selected for immediate use.`)
                    setFillerOpen(false)
                  }}
                >
                  <Check />Use this filler
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="outline" size="lg" onClick={() => move(1)} disabled={activeIndex === liveItems.length - 1} aria-label="Next" className="h-11 rounded-xl border-white/15 bg-white/[0.06] px-3 text-white hover:bg-white/10 hover:text-white disabled:text-white/20 lg:px-5">
            <span className="hidden lg:inline">Next</span><ArrowRight />
          </Button>
        </div>
      </footer>
    </div>
  )
}

function Meta({ label, value, icon: Icon = Clock3 }: { label: string; value: string; icon?: typeof Clock3 }) {
  return (
    <div className="rounded-xl bg-muted/70 p-3">
      <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground"><Icon className="size-3" />{label}</p>
      <p className="mt-1.5 text-xs font-semibold">{value}</p>
    </div>
  )
}

function CueCard({ label, value, icon: Icon, accent = false }: { label: string; value: string; icon: typeof Radio; accent?: boolean }) {
  return (
    <article className={cn("rounded-[20px] border p-4 shadow-[0_16px_45px_rgba(0,0,0,.16)]", accent ? "border-violet-400/20 bg-violet-400/10" : "border-white/10 bg-white/[0.05]")}>
      <p className={cn("flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]", accent ? "text-violet-300" : "text-white/35")}><Icon className="size-3.5" />{label}</p>
      <p className="mt-2.5 text-sm font-medium leading-6 text-white/80">{value}</p>
    </article>
  )
}

function ListenerBadge({ kind }: { kind: ListenerCue["kind"] }) {
  const styles = {
    WhatsApp: "bg-emerald-400/15 text-emerald-300",
    Text: "bg-sky-400/15 text-sky-300",
    "Voice note": "bg-violet-400/15 text-violet-300",
    Congregation: "bg-fuchsia-400/15 text-fuchsia-300",
    "New listener": "bg-amber-300/15 text-amber-200",
  }
  const Icon = kind === "Voice note" ? Mic2 : kind === "Congregation" ? Users : kind === "New listener" ? UserRoundPlus : MessageSquareText
  return <Badge className={cn("gap-1 border-0 text-[9px]", styles[kind])}><Icon className="size-3" />{kind}</Badge>
}
