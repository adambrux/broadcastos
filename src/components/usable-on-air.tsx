"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Music2,
  Plus,
  Radio,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StudioModeSwitch } from "@/components/studio-mode-switch"
import { AudioLevelMeter, LiveStatusPill, StudioAmbient } from "@/components/studio-motion"
import {
  parseListenerMessages,
  saveStudioWorkspace,
  studioShows,
  useStudioWorkspace,
  getContextFirstReadiness,
} from "@/lib/studio-workspace"
import { getUkTimeLabel } from "@/lib/schedule-data"
import { useScheduleClock } from "@/lib/use-schedule-clock"

export function UsableOnAir() {
  const workspace = useStudioWorkspace()
  const clock = useScheduleClock()
  const firstOpen = Math.max(0, workspace.items.findIndex((item) => !item.done))
  const [activeIndex, setActiveIndex] = useState(firstOpen)
  const [pasteValue, setPasteValue] = useState("")

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

  function markDone() {
    if (!current) return
    saveStudioWorkspace({
      ...workspace,
      items: workspace.items.map((item) => item.id === current.id ? { ...item, done: true } : item),
    })
    setActiveIndex((index) => Math.min(workspace.items.length - 1, index + 1))
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
      helper: "One clear idea only",
      text: current.script || "No main content added yet.",
      className: "border-white/10 bg-white/[0.045]",
      labelClassName: "text-white/45",
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
    <div className="fixed inset-0 z-[45] overflow-auto bg-[#08090d] text-white">
      <StudioAmbient />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#08090d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative grid h-10 w-[58px] shrink-0 place-items-center rounded-xl bg-white px-2 shadow-sm">
              <Image src="/premier-logo.svg" alt="Premier" width={126} height={59} priority className="h-auto w-[46px]" />
              <span className="studio-live-dot absolute right-0 top-0 border-2 border-white" />
            </span>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{show.name}</p><p className="text-[10px] text-white/40">Item {activeIndex + 1} of {workspace.items.length}</p></div>
          </div>
          <div className="hidden items-center gap-4 md:flex"><LiveStatusPill dark label="On Air" /><AudioLevelMeter dark className="h-8" /><StudioModeSwitch dark compact /><div className="text-center"><p className="font-mono text-2xl font-semibold">{getUkTimeLabel(new Date(clock))}</p><p className="text-[9px] uppercase tracking-[0.14em] text-white/35">UK time</p></div></div>
          <Button asChild variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Link href="/producer"><ArrowLeft />Exit On Air</Link></Button>
        </div>
        <div className="h-1 bg-white/5"><div className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400" style={{ width: `${progress}%` }} /></div>
      </header>

      <main className="relative mx-auto max-w-[1500px] space-y-4 px-5 pb-28 pt-4 sm:px-8">
        <section className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_70px_rgba(0,0,0,.2)]">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,.8fr)_minmax(220px,.75fr)] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-red-50 text-red-600"><span className="studio-live-dot" />Current</Badge>
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
                <Badge className="border-white/10 bg-white/10 text-white">{readiness?.ready ? "Ready to read" : `${readiness?.score ?? 0}/${readiness?.total ?? 5} complete`}</Badge>
              </div>

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
            </article>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Producer notes</p>
              <p className="mt-3 text-sm leading-6 text-white/75">{current.notes || "No producer notes"}</p>
            </div>
            <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-300/[0.08] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">Fallback if quiet</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-emerald-50/85">{current.fallback || "No fallback added. If this link depends on listener messages, add one in Producer Desk."}</p>
            </div>
            <div className="rounded-[22px] border border-amber-300/20 bg-amber-300/[0.08] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100">Station reminder</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-amber-50/85">{current.stationRequirement || "No station requirement"}</p>
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
          <Button variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" disabled={activeIndex === 0} onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}><ArrowLeft />Previous</Button>
          <Button className="h-12 rounded-xl bg-white px-7 text-ink hover:bg-white/90" onClick={markDone}><Check />Mark done</Button>
          <Button variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" disabled={!next} onClick={() => setActiveIndex((index) => Math.min(workspace.items.length - 1, index + 1))}>Next<ArrowRight /></Button>
        </div>
      </footer>
    </div>
  )
}
