"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  CircleDashed,
  Database,
  FilePlus2,
  Headphones,
  Music2,
  Sparkles,
} from "lucide-react"

import { ContentSourceBadge } from "@/components/content-source-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { sundaySchoolEpisodes, type SundaySchoolEpisode } from "@/lib/content-library"

type EditableEpisode = Omit<SundaySchoolEpisode, "productionNotes" | "soundDesignNotes" | "musicNotes"> & {
  productionNotes: string[]
  soundDesignNotes: string[]
  musicNotes: string[]
}

function cloneEpisode(episode: SundaySchoolEpisode): EditableEpisode {
  return {
    ...episode,
    productionNotes: [...episode.productionNotes],
    soundDesignNotes: [...episode.soundDesignNotes],
    musicNotes: [...episode.musicNotes],
  }
}

export function SundaySchoolLibraryPage() {
  const [episodes, setEpisodes] = useState<EditableEpisode[]>(sundaySchoolEpisodes.map(cloneEpisode))
  const [selected, setSelected] = useState<EditableEpisode | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newScript, setNewScript] = useState("")

  function addManualEpisode() {
    if (!newTitle.trim() || !newScript.trim()) return
    const episode: EditableEpisode = {
      id: `manual-${Date.now()}`,
      title: newTitle.trim(),
      date: "5 July 2026",
      topic: "Ready for editorial shaping",
      goldenText: "",
      forwardPromo: "",
      part1: newScript.trim(),
      part2: "",
      part3: "",
      prayer: "",
      productionNotes: ["Imported through manual paste. Review structure before production."],
      soundDesignNotes: [],
      musicNotes: [],
      podcastTitle: newTitle.trim(),
      podcastDescription: "",
      source: "Manual",
      status: "Draft",
    }
    setEpisodes((current) => [episode, ...current])
    setNewTitle("")
    setNewScript("")
    setCreating(false)
    setSelected(episode)
  }

  function updateSelected(key: keyof EditableEpisode, value: string) {
    if (!selected) return
    const updated = { ...selected, [key]: value }
    setSelected(updated)
    setEpisodes((current) => current.map((episode) => episode.id === updated.id ? updated : episode))
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[28px] bg-[#11131c] p-6 text-white shadow-card sm:p-8">
        <Link href="/content" className="inline-flex items-center gap-2 text-xs font-semibold text-white/55 hover:text-white"><ArrowLeft className="size-3.5" />Content Library</Link>
        <div className="mt-7 flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Badge className="border-white/10 bg-white/10 text-white"><BookOpenText />Sundays with Adam</Badge>
            <h1 className="mt-4 text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">Sunday School Library</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">A production-ready archive for every lesson, from the first forward promo to the final podcast description.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled className="h-11 rounded-xl border-white/15 bg-white/5 text-white opacity-70"><Database />Connect Notion database</Button>
            <Button className="h-11 rounded-xl bg-white px-5 text-[#11131c] hover:bg-white/90" onClick={() => setCreating(true)}><FilePlus2 />Manual paste / import</Button>
          </div>
        </div>
        <div className="mt-7 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/55"><CircleDashed className="size-4" /><strong className="font-semibold text-white/80">Notion is not connected.</strong> The button is a placeholder for a future database integration.</div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {episodes.map((episode, index) => (
          <button key={episode.id} type="button" onClick={() => setSelected(episode)} className="text-left">
            <Card className="h-full rounded-[24px] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-indigo/20 hover:shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand-indigo">{index === 0 ? <Sparkles className="size-5" /> : <BookOpenText className="size-5" />}</span><Badge className={episode.status === "Ready" ? "bg-success-soft text-success" : episode.status === "Draft" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"}>{episode.status}</Badge></div>
                <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />{episode.date}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">{episode.title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{episode.topic}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4"><ContentSourceBadge source={episode.source} /><span className="text-xs font-medium text-brand-indigo">Open episode →</span></div>
              </CardContent>
            </Card>
          </button>
        ))}
      </section>

      <section className="rounded-[26px] border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Headphones className="size-5" /></span><div><h2 className="font-semibold">Each episode is a complete broadcast object</h2><p className="text-sm text-muted-foreground">Script, production, sound design and podcast metadata travel together.</p></div></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Three-part scripts", "Golden text + prayer", "Sound and music direction", "Podcast packaging"].map((label) => <div key={label} className="rounded-2xl border bg-muted/20 px-4 py-4 text-sm font-medium">{label}</div>)}
        </div>
      </section>

      <Sheet open={creating} onOpenChange={setCreating}>
        <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-xl">
          <SheetHeader className="text-left"><SheetTitle>Paste a Sunday School script</SheetTitle><SheetDescription>Create an editable draft. BroadcastOS will not claim this came from Notion or AI.</SheetDescription></SheetHeader>
          <div className="mt-7 space-y-5">
            <label className="block"><span className="mb-2 block text-xs font-semibold">Episode title</span><Input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="e.g. Grace for the Next Step" className="rounded-xl" /></label>
            <label className="block"><span className="mb-2 block text-xs font-semibold">Paste script</span><textarea value={newScript} onChange={(event) => setNewScript(event.target.value)} placeholder="Paste the source script here…" className="min-h-80 w-full rounded-2xl border bg-muted/20 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring" /></label>
            <ContentSourceBadge source="Manual" />
            <Button className="primary-action w-full rounded-xl text-white" disabled={!newTitle.trim() || !newScript.trim()} onClick={addManualEpisode}><FilePlus2 />Create editable episode</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-2xl">
          {selected && <>
            <SheetHeader className="text-left"><div className="flex flex-wrap gap-2"><ContentSourceBadge source={selected.source} /><Badge variant="outline">{selected.status}</Badge></div><SheetTitle className="pt-3 text-2xl">{selected.title}</SheetTitle><SheetDescription>{selected.date} · {selected.topic}</SheetDescription></SheetHeader>
            <div className="mt-7 space-y-6">
              {[
                ["topic", "Topic", selected.topic],
                ["goldenText", "Golden text", selected.goldenText],
                ["forwardPromo", "Forward promo", selected.forwardPromo],
                ["part1", "Part 1 script", selected.part1],
                ["part2", "Part 2 script", selected.part2],
                ["part3", "Part 3 script", selected.part3],
                ["prayer", "Prayer", selected.prayer],
                ["podcastTitle", "Podcast title", selected.podcastTitle],
                ["podcastDescription", "Podcast description", selected.podcastDescription],
              ].map(([key, label, value]) => <label key={key} className="block"><span className="mb-2 block text-xs font-semibold">{label}</span><textarea value={value} onChange={(event) => updateSelected(key as keyof EditableEpisode, event.target.value)} rows={key.startsWith("part") ? 5 : 3} className="w-full resize-y rounded-xl border bg-muted/15 p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring" /></label>)}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border p-4"><p className="flex items-center gap-2 text-sm font-semibold"><Music2 className="size-4 text-brand-indigo" />Music & sound design</p><ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">{[...selected.soundDesignNotes, ...selected.musicNotes].map((note) => <li key={note}>• {note}</li>)}</ul></div>
                <div className="rounded-2xl border p-4"><p className="text-sm font-semibold">Production notes</p><ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">{selected.productionNotes.map((note) => <li key={note}>• {note}</li>)}</ul></div>
              </div>
              <Button className="primary-action w-full rounded-xl text-white" onClick={() => setSelected(null)}>Save episode changes</Button>
            </div>
          </>}
        </SheetContent>
      </Sheet>
    </div>
  )
}
