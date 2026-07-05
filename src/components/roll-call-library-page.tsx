"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  Download,
  MapPin,
  Search,
  Sparkles,
  UserRoundPlus,
  UsersRound,
} from "lucide-react"

import { ContentSourceBadge } from "@/components/content-source-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { masterRollCallScript, rollCallMembers } from "@/lib/content-library"

export function RollCallLibraryPage() {
  const [script, setScript] = useState(masterRollCallScript)
  const [query, setQuery] = useState("")
  const [copied, setCopied] = useState(false)

  const readTime = Math.max(1, Math.ceil(script.trim().split(/\s+/).filter(Boolean).length / 145))
  const filtered = useMemo(() => rollCallMembers.filter((member) =>
    `${member.title ?? ""} ${member.name} ${member.location} ${member.familyGroup ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  ), [query])
  const families = new Set(rollCallMembers.map((member) => member.familyGroup).filter(Boolean)).size

  async function copyScript() {
    await navigator.clipboard.writeText(script)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function exportScript() {
    const file = new Blob([script], { type: "text/plain;charset=utf-8" })
    const href = URL.createObjectURL(file)
    const anchor = document.createElement("a")
    anchor.href = href
    anchor.download = "sundays-with-adam-master-roll-call.txt"
    anchor.click()
    URL.revokeObjectURL(href)
  }

  return (
    <div className="space-y-6">
      <header className="soft-gradient rounded-[28px] border border-brand-indigo/10 p-6 shadow-card sm:p-8">
        <Link href="/content" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" />Content Library</Link>
        <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap gap-2"><Badge className="bg-brand-soft text-brand-indigo"><UsersRound />Sundays with Adam</Badge><ContentSourceBadge source="Manual" /></div>
            <h1 className="mt-4 text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">Roll Call Library</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">The permanent, cumulative home of the Sunday Show Congregation. The master script stays editable while structured records remain ready for future generation.</p>
          </div>
          <Button asChild className="primary-action h-11 self-start rounded-xl text-white xl:self-auto">
            <Link href="/content/import"><UserRoundPlus />Add congregation member</Link>
          </Button>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            ["Congregation records", rollCallMembers.length, "Permanent members"],
            ["Family groups", families, "Preserved together"],
            ["New additions", rollCallMembers.filter((member) => member.newAddition).length, "Welcome this week"],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-2xl border border-white/80 bg-white/70 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,.65fr)]">
        <Card className="rounded-[26px] shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">On-air source</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Master Roll Call Script</h2>
                <p className="mt-1 text-sm text-muted-foreground">Paste or shape the full script Adam will read on Sunday.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl" onClick={copyScript}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy"}</Button>
                <Button variant="outline" className="rounded-xl" onClick={exportScript}><Download />Export</Button>
              </div>
            </div>
            <textarea aria-label="Master Roll Call Script" value={script} onChange={(event) => setScript(event.target.value)} className="mt-6 min-h-[430px] w-full resize-y rounded-2xl border bg-[#fbfbfd] p-5 text-[15px] leading-7 outline-none transition focus:border-brand-indigo/40 focus:ring-4 focus:ring-brand-soft" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{script.trim().split(/\s+/).filter(Boolean).length} words · edits stay in this workspace for now</span>
              <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 font-medium text-brand-indigo"><Clock3 className="size-3.5" />Estimated read time: {readTime} min</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[24px] border-brand-indigo/10 bg-brand-soft/45 shadow-sm">
            <CardContent className="p-6">
              <Sparkles className="size-5 text-brand-indigo" />
              <h2 className="mt-4 text-lg font-semibold">Cumulative by design</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Members remain in the Congregation until manually removed. New additions are called out separately without replacing the permanent roll call.</p>
            </CardContent>
          </Card>
          <Card className="rounded-[24px] shadow-sm">
            <CardContent className="p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Script health</p>
              <div className="mt-5 space-y-4">
                {[
                  ["Titles preserved", "Pastor, Sister and Aunty"],
                  ["Pronunciations ready", `${rollCallMembers.filter((member) => member.pronunciation).length} records annotated`],
                  ["Location context", "Included where useful on air"],
                  ["Duplicate scan", "No duplicate in master list"],
                ].map(([label, note]) => <div key={label} className="flex gap-3"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success"><Check className="size-3" /></span><div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{note}</p></div></div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="rounded-[26px] border bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Structured view</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Congregation records</h2><p className="mt-1 text-sm text-muted-foreground">The data layer that will later generate the master script.</p></div>
          <label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, family or place" className="h-10 rounded-xl pl-9 sm:w-72" /></label>
        </div>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {filtered.map((member) => (
            <article key={member.id} className="rounded-2xl border border-border/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{member.title ? `${member.title} ` : ""}{member.name}</h3>{member.newAddition && <Badge className="bg-brand-magenta/10 text-brand-magenta">New this week</Badge>}</div><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3" />{member.location}{member.locationNote ? ` · ${member.locationNote}` : ""}</p></div>
                <span className="size-2 rounded-full bg-success" title="Included in roll call" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {member.familyGroup && <span className="rounded-full bg-muted px-2.5 py-1">{member.familyGroup}</span>}
                {member.pronunciation && <span className="rounded-full bg-brand-soft px-2.5 py-1 text-brand-indigo">Say: {member.pronunciation}</span>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
