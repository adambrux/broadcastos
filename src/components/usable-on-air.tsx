"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  Music2,
  Plus,
  Radio,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LaunchSequenceBody, LaunchSequenceIndicator } from "@/components/show-launch-sequence"
import { StudioModeSwitch } from "@/components/studio-mode-switch"
import { AudioLevelMeter, LiveStatusPill, StudioAmbient } from "@/components/studio-motion"
import { useLaunchSequence } from "@/lib/launch-sequence"
import {
  parseListenerMessages,
  saveStudioWorkspace,
  studioShows,
  useStudioWorkspace,
  getContextFirstReadiness,
} from "@/lib/studio-workspace"
import { getUkTimeLabel } from "@/lib/schedule-data"
import { useScheduleClock } from "@/lib/use-schedule-clock"
import { cn } from "@/lib/utils"
import { broadcastOSVersion } from "@/lib/version"

function isLinerLink(item?: { title?: string; script?: string }) {
  if (!item) return false
  return /liner link|station liner|\bP[12]\b/i.test(item.title ?? "") || /\[LINER STARTS HERE/i.test(item.script ?? "")
}

export function UsableOnAir() {
  const workspace = useStudioWorkspace()
  const clock = useScheduleClock()
  const firstOpen = Math.max(0, workspace.items.findIndex((item) => !item.done))
  const [activeIndex, setActiveIndex] = useState(firstOpen)
  const [pasteValue, setPasteValue] = useState("")
  const [markingDone, setMarkingDone] = useState(false)
  const [studioResetConfirmed, setStudioResetConfirmed] = useState(false)
  const [responseChoices, setResponseChoices] = useState<Record<string, "yes" | "no">>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const current = workspace.items[activeIndex]
  const next = workspace.items[activeIndex + 1]
  const selectedMessages = useMemo(() => workspace.messages.filter((message) => message.selected), [workspace.messages])
  const selectedSongRequests = useMemo(
    () => selectedMessages.flatMap((message) => message.songRequests.map((request) => ({ id: `${message.id}-${request}`, request, sender: message.sender }))),
    [selectedMessages]
  )
  const progress = workspace.items.length ? ((activeIndex + (current?.done ? 1 : 0)) / workspace.items.length) * 100 : 0
  const show = studioShows[workspace.showId]
  const readiness = current ? getContextFirstReadiness(current, show.name) : null
  const isLastItem = activeIndex === workspace.items.length - 1
  const launchSequence = useLaunchSequence(workspace.showId, workspace.date)
  const hourItems = useMemo(() => workspace.items.filter((item) => item.hour === current?.hour), [current?.hour, workspace.items])
  const hourIndex = current ? hourItems.findIndex((item) => item.id === current.id) : -1
  const hourLinkTotal = hourItems.length || workspace.items.length
  const hourLinkNumber = hourIndex >= 0 ? hourIndex + 1 : activeIndex + 1
  const hourLabel = current?.hour || "Current hour"
  const finalResetRequired = Boolean(current?.done && isLastItem && !studioResetConfirmed)
  const responseChoice = current ? responseChoices[current.id] : undefined
  const hasResponseGate = Boolean(current?.responseGate && current?.momentNoResponses?.trim() && current?.script?.trim())
  const responseGateOpen = hasResponseGate && !responseChoice
  const visibleMoment = hasResponseGate && responseChoice === "no"
    ? current?.momentNoResponses ?? ""
    : current?.script ?? ""
  const linerLink = isLinerLink(current)

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [activeIndex])

  function moveToItem(index: number) {
    setStudioResetConfirmed(false)
    setActiveIndex(Math.min(workspace.items.length - 1, Math.max(0, index)))
  }

  function markDone() {
    if (!current || markingDone || responseGateOpen) return
    setMarkingDone(true)
    window.setTimeout(() => {
      saveStudioWorkspace({
        ...workspace,
        items: workspace.items.map((item) => item.id === current.id ? { ...item, done: true } : item),
      })
      setMarkingDone(false)
      if (!isLastItem) moveToItem(activeIndex + 1)
    }, 450)
  }

  function addMessages() {
    const messages = parseListenerMessages(pasteValue)
    if (!messages.length) return
    saveStudioWorkspace({ ...workspace, messages: [...workspace.messages, ...messages] })
    setPasteValue("")
  }

  if (!current) {
    return (
      <div className="fixed inset-0 z-[45] grid place-items-center bg-[#08090d] p-6 text-white">
        <div className="max-w-lg text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-ink"><Radio /></span>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">Nothing is loaded for On Air</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">Start blank or load a show template in Producer Desk, then add the content you need for today.</p>
          <Button asChild className="mt-6 h-11 rounded-xl bg-white text-ink hover:bg-white/90"><Link href="/producer"><ArrowLeft />Open Producer Desk</Link></Button>
        </div>
      </div>
    )
  }

  const liveSteps = [
    {
      number: "1",
      label: "Context",
      helper: "Say this first",
      text: current.context || "No context added yet. Exit On Air and add the 10-second opening context in Producer Desk.",
      className: "border-violet-400/35 bg-violet-500/12",
      labelClassName: "text-violet-200",
      textClassName: "text-[28px] font-semibold leading-[1.35] tracking-[-0.035em] sm:text-[38px]",
    },
    {
      number: "2",
      label: "Recap",
      helper: "For anyone just joining",
      text: current.recap || "No recap added.",
      className: "border-white/10 bg-white/[0.045]",
      labelClassName: "text-white/45",
      textClassName: "text-[22px] font-medium leading-[1.45] tracking-[-0.02em] sm:text-[28px]",
    },
    {
      number: "3",
      label: "The Moment",
      helper: hasResponseGate ? (responseChoice === "yes" ? "If responses" : "If no responses") : "One clear idea only",
      text: visibleMoment || "No main content added yet.",
      className: linerLink ? "border-fuchsia-300/30 bg-fuchsia-400/10" : "border-white/10 bg-white/[0.045]",
      labelClassName: linerLink ? "text-fuchsia-100" : "text-white/45",
      textClassName: "text-[22px] font-medium leading-[1.45] tracking-[-0.02em] sm:text-[28px]",
    },
    {
      number: "4",
      label: "Call To Action",
      helper: "Ask for one thing",
      text: current.cta || "No CTA added.",
      className: "border-fuchsia-400/25 bg-fuchsia-500/10",
      labelClassName: "text-fuchsia-200",
      textClassName: "text-[23px] font-semibold leading-[1.35] tracking-[-0.02em] sm:text-[30px]",
    },
    {
      number: "5",
      label: "Tease ahead",
      helper: "Give them a reason to stay",
      text: current.tease || "No tease added.",
      className: "border-cyan-300/20 bg-cyan-300/10",
      labelClassName: "text-cyan-100",
      textClassName: "text-[21px] font-semibold leading-[1.4] tracking-[-0.02em] sm:text-[27px]",
    },
  ]

  return (
    <div ref={scrollContainerRef} className="fixed inset-0 z-[45] overflow-auto bg-[#08090d] text-white">
      <StudioAmbient />
      <LaunchSequenceIndicator showId={workspace.showId} date={workspace.date} dark />
      {!launchSequence.complete && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#08090d] p-5 text-white sm:p-8">
          <StudioAmbient />
          <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center">
            <div className="rounded-[34px] border border-red-300/25 bg-white/[0.045] p-5 shadow-[0_30px_120px_rgba(0,0,0,.45)] sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge className="bg-red-600 text-white"><LockKeyhole />Pre-launch required</Badge>
                  <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Stop. Check the studio first.</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">
                    On Air is locked until the live London launch sequence is complete, or this show is marked as pre-recorded.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Checks complete</p>
                  <p className="mt-1 font-mono text-4xl font-black">{launchSequence.completedCount}/{launchSequence.totalCount}</p>
                </div>
              </div>
              <div className="mt-7">
                <LaunchSequenceBody showId={workspace.showId} date={workspace.date} dark />
              </div>
            </div>
          </div>
        </div>
      )}
      {finalResetRequired && (
        <div className="fixed inset-0 z-[75] grid place-items-center overflow-y-auto bg-[#08090d] p-5 text-white sm:p-8">
          <StudioAmbient />
          <div className="relative w-full max-w-3xl rounded-[36px] border border-amber-300/30 bg-amber-300/[0.10] p-6 shadow-[0_30px_120px_rgba(0,0,0,.55)] sm:p-9">
            <Badge className="bg-amber-300 text-ink"><AlertTriangle />End of show reset required</Badge>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              Switch Zetta from Live Assist back to Auto.
            </h1>
            <p className="mt-5 text-lg leading-8 text-amber-50/80">
              Do this before leaving the studio. This screen stays here until you confirm the studio has been reset.
            </p>
            <div className="mt-7 rounded-[26px] border border-white/10 bg-black/25 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100">Final checks</p>
              <ul className="mt-4 space-y-3 text-base text-white/80">
                <li className="flex gap-3"><Check className="mt-0.5 size-5 text-amber-200" />Zetta switched from Live Assist to Auto.</li>
                <li className="flex gap-3"><Check className="mt-0.5 size-5 text-amber-200" />Mic volume slider brought down.</li>
                <li className="flex gap-3"><Check className="mt-0.5 size-5 text-amber-200" />Channel 3/beds/cues brought down.</li>
              </ul>
            </div>
            <div className="mt-7">
              <Button className="h-14 w-full rounded-2xl bg-amber-300 text-base font-semibold text-ink hover:bg-amber-200" onClick={() => setStudioResetConfirmed(true)}>
                <ShieldCheck />I’ve reset the studio
              </Button>
              <p className="mt-3 text-center text-xs font-medium text-amber-50/55">You can exit On Air after confirming this reset.</p>
            </div>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#08090d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative grid h-10 w-[58px] shrink-0 place-items-center rounded-xl bg-white px-2 shadow-sm">
              <Image src="/premier-logo.svg" alt="Premier" width={126} height={59} priority className="h-auto w-[46px]" />
              <span className="studio-live-dot absolute right-0 top-0 border-2 border-white" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold">{show.name}</p>
                <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[9px] font-bold text-white/70">v{broadcastOSVersion.code} · {broadcastOSVersion.build}</span>
              </div>
              <p className="text-[10px] text-white/40">{hourLabel} · Link {hourLinkNumber}/{hourLinkTotal} · Show {activeIndex + 1}/{workspace.items.length}</p>
            </div>
          </div>
          <div className="hidden items-center gap-4 md:flex"><LiveStatusPill dark label="On Air" /><AudioLevelMeter dark className="h-8" /><StudioModeSwitch dark compact /><div className="text-center"><p className="font-mono text-2xl font-semibold">{getUkTimeLabel(new Date(clock))}</p><p className="text-[9px] uppercase tracking-[0.14em] text-white/35">UK time</p></div></div>
          <Button asChild variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Link href="/producer"><ArrowLeft />Exit On Air</Link></Button>
        </div>
        <div className="h-3 overflow-hidden bg-white/5">
          <div className="relative h-full rounded-r-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 transition-all duration-700 ease-out" style={{ width: `${progress}%` }}>
            <span className="absolute inset-0 animate-pulse bg-white/25" />
            <span className="absolute right-0 top-1/2 size-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,.85)]" />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1500px] space-y-4 px-5 pb-28 pt-4 sm:px-8">
        {isLastItem && (
          <section className="rounded-[24px] border border-amber-300/30 bg-amber-300/[0.12] p-5 shadow-[0_18px_70px_rgba(0,0,0,.22)]">
            <div className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-300 text-ink">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100">End of show studio reset</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
                  After the final link, switch Zetta from Live Assist back to Auto.
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-50/75">
                  Do this before leaving the studio so the next output is in the correct state.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_70px_rgba(0,0,0,.2)]">
          <div className="mb-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">{hourLabel}</p>
                <p className="mt-1 text-4xl font-black tracking-[-0.06em] sm:text-5xl">Link {hourLinkNumber}/{hourLinkTotal}</p>
              </div>
              <div className="min-w-0 sm:border-l sm:border-white/10 sm:pl-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Current screen</p>
                <p className="mt-1 truncate text-2xl font-semibold tracking-[-0.04em]">{current.title}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left sm:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Whole show</p>
                <p className="mt-1 font-mono text-2xl font-black">{activeIndex + 1}/{workspace.items.length}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,.8fr)_minmax(220px,.75fr)] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-red-50 text-red-600"><span className="studio-live-dot" />Current</Badge>
                {hasResponseGate && <Badge className="bg-violet-200 text-violet-950">Response Gate {responseChoice ? responseChoice.toUpperCase() : "needed"}</Badge>}
                {linerLink && <Badge className="bg-fuchsia-200 text-fuchsia-950">Liner link</Badge>}
                <span className="font-mono text-[10px] text-white/40">{current.time || "No fixed time"}</span>
                <span className="text-[10px] text-white/35">Item {activeIndex + 1} of {workspace.items.length}</span>
              </div>
              <h1 className="mt-2 truncate text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{current.title}</h1>
              <p className="mt-1 truncate text-xs text-white/45">{current.hour || "No hour set"} · {current.featureId || current.type}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Objective</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-white/75">{current.objective || "No objective added"}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Up next</p>
              {next ? (
                <>
                  <p className="mt-1 truncate text-sm font-semibold">{next.title}</p>
                  <p className="mt-1 truncate text-[10px] text-white/40">{next.time || "No fixed time"} · {next.featureId || next.type}</p>
                </>
              ) : (
                <p className="mt-1 text-sm font-semibold">End of show</p>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[10px] text-white/40">
            <span>{workspace.mode === "in-studio" ? "Studio companion: Zetta and WhatsApp stay on in-house systems." : "Remote mode: paste WhatsApp manually. Zetta is not connected."}</span>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/10 bg-white/10 text-white">{workspace.mode === "in-studio" ? "In studio" : "Remote"}</Badge>
              <Badge className="border-white/10 bg-white/10 text-white">{readiness?.ready ? "Framework ready" : `${readiness?.score ?? 0}/${readiness?.total ?? 5} complete`}</Badge>
              <span className="hidden font-mono text-white/35 sm:inline">{getUkTimeLabel(new Date(clock))} UK</span>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
          <section className="space-y-4">
            <article className="rounded-[30px] border border-white/10 bg-white/[0.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,.24)] sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">BroadcastOS Link Framework</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] sm:text-2xl">Read from top to bottom</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {linerLink && <Badge className="bg-fuchsia-200 text-fuchsia-950">Liner gear-change</Badge>}
                  <Badge className="border-white/10 bg-white/10 text-white">{responseGateOpen ? "Choose response state" : readiness?.ready ? "Ready to read" : `${readiness?.score ?? 0}/${readiness?.total ?? 5} complete`}</Badge>
                </div>
              </div>

              {responseGateOpen ? (
                <div className="rounded-[28px] border border-violet-300/35 bg-violet-400/[0.13] p-6 text-center sm:p-8">
                  <Badge className="bg-violet-200 text-violet-950"><AlertTriangle />Response Gate</Badge>
                  <h3 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                    Do you have listener responses?
                  </h3>
                  <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-violet-50/70">
                    Choose what is true. BroadcastOS will only show the matching version of The Moment.
                  </p>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <Button
                      className="h-24 rounded-[26px] bg-emerald-300 text-2xl font-black text-ink hover:bg-emerald-200"
                      onClick={() => setResponseChoices((choices) => ({ ...choices, [current.id]: "yes" }))}
                    >
                      <CheckCircle2 className="size-7" />YES
                    </Button>
                    <Button
                      className="h-24 rounded-[26px] bg-white text-2xl font-black text-ink hover:bg-white/90"
                      onClick={() => setResponseChoices((choices) => ({ ...choices, [current.id]: "no" }))}
                    >
                      <ArrowRight className="size-7" />NO
                    </Button>
                  </div>
                  <p className="mt-5 text-xs font-medium text-violet-50/45">
                    The unused Moment will stay hidden. One link, one script, zero mid-read decisions.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveSteps.map((step) => (
                  <section key={step.number} className={`rounded-[24px] border p-5 sm:p-6 ${step.className}`}>
                    <div className="flex gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-base font-semibold text-ink sm:size-12">{step.number}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${step.labelClassName}`}>{step.label}</p>
                          <span className="text-[10px] text-white/30">· {step.helper}</span>
                        </div>
                        <p className={`mt-3 whitespace-pre-wrap ${step.textClassName}`}>{step.text}</p>
                      </div>
                    </div>
                  </section>
                  ))}
                </div>
              )}
            </article>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Producer notes</p>
              <p className="mt-3 text-sm leading-6 text-white/75">{current.notes || "No producer notes"}</p>
            </div>
            <div className="rounded-[22px] border border-amber-300/20 bg-amber-300/[0.08] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100">Station reminder</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-amber-50/85">{current.stationRequirement || "No station requirement"}</p>
            </div>
            <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100">What comes next</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-cyan-50/85">{current.next || next?.title || "No next item added"}</p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Up next</p>
              {next ? <><p className="mt-3 text-xl font-semibold">{next.title}</p><p className="mt-2 font-mono text-xs text-white/45">{next.time || "No fixed time"} · {next.duration}</p><p className="mt-3 text-sm leading-6 text-white/60">{next.objective}</p></> : <p className="mt-3 text-lg font-semibold">End of show</p>}
            </div>

            {workspace.mode === "remote" && <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Pasted messages</p><Badge className="bg-white/10 text-white">{selectedMessages.length}</Badge></div>
              <div className="mt-4 space-y-2">
                {selectedMessages.length ? selectedMessages.map((message) => (
                  <div key={message.id} className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/75">
                    <div className="flex flex-wrap items-center gap-2">
                      {message.sender && <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-white">{message.sender}</span>}
                      {message.songRequests.length > 0 && <span className="rounded-full bg-violet-300/15 px-2 py-1 text-[10px] font-semibold text-violet-100"><Music2 className="mr-1 inline size-3" />Song request</span>}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap">{message.body}</p>
                  </div>
                )) : <p className="text-xs leading-5 text-white/40">Paste listener messages below or in Producer Desk.</p>}
              </div>
              {selectedSongRequests.length > 0 && (
                <div className="mt-4 rounded-2xl border border-violet-300/15 bg-violet-300/[0.08] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100">Song requests</p>
                  <div className="mt-2 space-y-2">
                    {selectedSongRequests.map((song) => (
                      <div key={song.id} className="rounded-xl bg-black/20 p-2 text-xs text-white/75">
                        <p className="font-semibold text-white">{song.request}</p>
                        {song.sender && <p className="mt-1 text-white/40">From {song.sender}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <textarea rows={4} spellCheck value={pasteValue} onChange={(event) => setPasteValue(event.target.value)} placeholder="Paste WhatsApp blocks. Multi-line messages stay together…" className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white outline-none placeholder:text-white/25 focus:border-violet-400/40" />
              <Button variant="outline" size="sm" className="mt-2 w-full rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={addMessages}><Plus />Add messages</Button>
            </div>}
          </aside>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#08090d]/95 px-5 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
          <Button variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" disabled={activeIndex === 0} onClick={() => moveToItem(activeIndex - 1)}><ArrowLeft />Previous</Button>
          <Button
            className={cn(
              "h-14 min-w-44 rounded-2xl px-8 text-base font-semibold transition-all duration-300",
              markingDone ? "scale-110 bg-success text-white shadow-[0_0_45px_rgba(50,180,120,.55)]" : "bg-white text-ink hover:bg-white/90"
            )}
            onClick={markDone}
            disabled={markingDone || responseGateOpen}
          >
            {markingDone ? <RotateCcw className="animate-spin" /> : <Check />}
            {responseGateOpen ? "Choose YES or NO first" : markingDone ? "Done — moving…" : isLastItem ? "Finish show" : "Mark done"}
          </Button>
          <Button variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" disabled={!next} onClick={() => moveToItem(activeIndex + 1)}>Next<ArrowRight /></Button>
        </div>
      </footer>
    </div>
  )
}
