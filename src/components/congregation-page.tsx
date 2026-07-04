"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Church,
  Copy,
  Headphones,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Volume2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { listenerProfiles, newListenerQueue } from "@/lib/listener-data"
import { cn } from "@/lib/utils"

type CongregationMember = {
  id: string
  name: string
  location: string
  pronunciation: string
  familyGroup?: string
}

const initialMembers: CongregationMember[] = listenerProfiles
  .filter((listener) => listener.inCongregation)
  .map(({ id, name, location, pronunciation, familyGroup }) => ({ id, name, location, pronunciation, familyGroup }))

export function CongregationPage() {
  const [members, setMembers] = useState<CongregationMember[]>(initialMembers)
  const [queue, setQueue] = useState([...newListenerQueue])
  const [selected, setSelected] = useState<string[]>(initialMembers.map((member) => member.id))
  const [search, setSearch] = useState("")
  const [familyGrouping, setFamilyGrouping] = useState(true)
  const [notice, setNotice] = useState("")

  const visibleMembers = useMemo(
    () => members.filter((member) => `${member.name} ${member.location}`.toLowerCase().includes(search.toLowerCase())),
    [members, search]
  )

  const rollCall = useMemo(() => {
    const chosen = members.filter((member) => selected.includes(member.id))
    if (!familyGrouping) return chosen
    return [...chosen].sort((a, b) => (a.familyGroup || a.name).localeCompare(b.familyGroup || b.name))
  }, [familyGrouping, members, selected])

  function addToCongregation(candidate: (typeof queue)[number]) {
    if (candidate.duplicate) return
    const member: CongregationMember = {
      id: candidate.id,
      name: candidate.name,
      location: candidate.location,
      pronunciation: candidate.pronunciation,
    }
    setMembers((current) => [...current, member])
    setSelected((current) => [...current, member.id])
    setQueue((current) => current.filter((item) => item.id !== candidate.id))
    setNotice(`${candidate.name} has been added permanently to the Sunday Show Congregation.`)
  }

  function removeMember(id: string) {
    const member = members.find((item) => item.id === id)
    setMembers((current) => current.filter((item) => item.id !== id))
    setSelected((current) => current.filter((item) => item !== id))
    if (member) setNotice(`${member.name} was manually removed from the Congregation.`)
  }

  function toggleSelected(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  return (
    <div className="space-y-5">
      <Link href="/listeners" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />Listener Hub
      </Link>

      <section className="soft-gradient overflow-hidden rounded-[26px] border border-brand-indigo/10 p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="bg-brand-soft text-brand-indigo"><Church />Sundays with Adam</Badge>
              <Badge variant="outline" className="bg-white/70">Permanent community</Badge>
            </div>
            <h1 className="text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">Sunday Show Congregation</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">A cumulative roll call of regular listeners, families and churches who gather with the show every Sunday.</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-5 text-center ring-1 ring-white">
            <p className="text-4xl font-semibold tracking-[-0.05em]">1,284</p>
            <p className="mt-1 text-xs text-muted-foreground">Permanent members</p>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-brand-indigo/10 bg-brand-soft/70 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-indigo" />
        <div>
          <p className="text-sm font-semibold">Permanent means permanent by default</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Once added, a listener stays in every future Roll Call. Membership never expires through inactivity and can only be changed with the manual remove action.</p>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success">
          <Check className="size-4" />{notice}
          <button type="button" onClick={() => setNotice("")} className="ml-auto text-xs font-semibold">Dismiss</button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
        <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="flex flex-row items-start justify-between px-6 pb-3 pt-5">
            <div><CardTitle className="flex items-center gap-2"><UserPlus className="size-4 text-brand-magenta" />New Listener Queue</CardTitle><p className="mt-1.5 text-xs text-muted-foreground">Review regular engagement before adding permanently.</p></div>
            <Badge variant="outline">{queue.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {queue.map((candidate) => (
              <article key={candidate.id} className={cn("rounded-2xl border p-4", candidate.duplicate ? "border-amber-200 bg-amber-50/70" : "bg-white")}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold", candidate.duplicate ? "bg-amber-100 text-amber-700" : "bg-brand-soft text-brand-indigo")}>{candidate.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">{candidate.name}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="size-3" />{candidate.location}</span><span>{candidate.source}</span><span className="flex items-center gap-1"><Volume2 className="size-3" />{candidate.pronunciation}</span></p>
                  </div>
                  <Button size="sm" disabled={Boolean(candidate.duplicate)} onClick={() => addToCongregation(candidate)} className={cn("rounded-xl", !candidate.duplicate && "primary-action text-white")}>
                    <Plus />Add to Congregation
                  </Button>
                </div>
                {candidate.duplicate && <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-100/70 px-3 py-2 text-xs font-medium text-amber-800"><AlertTriangle className="size-4" />{candidate.duplicate}</div>}
              </article>
            ))}
            {queue.length === 0 && <div className="rounded-2xl bg-muted/50 p-8 text-center text-sm text-muted-foreground">Queue cleared. New regulars will appear here.</div>}
          </CardContent>
        </Card>

        <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="flex flex-row items-start justify-between px-6 pb-3 pt-5">
            <div><CardTitle className="flex items-center gap-2"><Headphones className="size-4 text-brand-indigo" />Pronunciation notes</CardTitle><p className="mt-1.5 text-xs text-muted-foreground">Presenter-ready guidance for a warm, accurate Roll Call.</p></div>
            <Badge className="bg-brand-soft text-brand-indigo">{members.length}</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-border/70 px-6 pb-5">
            {members.slice(0, 6).map((member) => (
              <div key={member.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                <span className="text-xs font-medium">{member.name}</span>
                <span className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground"><Volume2 className="size-3" />{member.pronunciation}</span>
                <Button variant="ghost" size="icon-sm" aria-label={`Play pronunciation for ${member.name}`}><Headphones /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="px-6 pb-3 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><CardTitle className="flex items-center gap-2"><Church className="size-4 text-brand-indigo" />Permanent Congregation</CardTitle><p className="mt-1.5 text-xs text-muted-foreground">Search, review or manually remove a member.</p></div>
              <div className="relative w-full sm:w-56"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a member…" className="h-9 rounded-xl pl-9" /></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-4 pb-5">
            {visibleMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted/50">
                <span className="grid size-9 place-items-center rounded-full bg-brand-soft text-[10px] font-semibold text-brand-indigo">{member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{member.name}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{member.location}{member.familyGroup ? ` · ${member.familyGroup}` : ""}</span></span>
                <Button variant="ghost" size="icon-sm" onClick={() => removeMember(member.id)} aria-label={`Manually remove ${member.name}`}><Trash2 /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="px-6 pb-3 pt-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-brand-magenta" />Family grouping</CardTitle><p className="mt-1.5 text-xs text-muted-foreground">Keep households together in the spoken Roll Call.</p></div>
              <button type="button" onClick={() => setFamilyGrouping((current) => !current)} className={cn("rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors", familyGrouping ? "bg-success-soft text-success" : "bg-muted text-muted-foreground")}>{familyGrouping ? "Grouping on" : "Grouping off"}</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {[
              { name: "Williams family", members: "Marcia, David and Grace", location: "Croydon" },
              { name: "Okafor family", members: "Chidi, Ada, Joshua and baby Amara", location: "Birmingham" },
              { name: "Thompson household", members: "Eleanor and Micah", location: "Nottingham" },
            ].map((family) => (
              <div key={family.name} className="rounded-xl border bg-muted/25 p-4">
                <div className="flex items-start gap-3"><Users className="mt-0.5 size-4 text-brand-indigo" /><div><p className="text-xs font-semibold">{family.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{family.members}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="size-3" />{family.location}</p></div></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[24px] py-0 shadow-card ring-border/80">
        <CardHeader className="border-b bg-ink px-6 py-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><CardTitle className="flex items-center gap-2"><Copy className="size-4 text-brand-magenta" />Roll Call Builder</CardTitle><p className="mt-1.5 text-xs text-white/50">Build this Sunday’s read without changing permanent membership.</p></div>
            <div className="flex gap-2"><Badge className="bg-white/10 text-white">{selected.length} selected</Badge><Button size="sm" className="bg-white text-ink hover:bg-white/90" onClick={() => setNotice("Roll Call copied and ready for ProducerOS.")}><Copy />Copy Roll Call</Button></div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-0 p-0 lg:grid-cols-[.8fr_1.2fr]">
          <div className="border-b p-5 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Include this week</p>
            <div className="space-y-1">
              {members.map((member) => {
                const active = selected.includes(member.id)
                return (
                  <button key={member.id} type="button" onClick={() => toggleSelected(member.id)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", active ? "bg-brand-soft" : "hover:bg-muted/50")}>
                    <span className={cn("grid size-5 place-items-center rounded-md border", active ? "border-brand-indigo bg-brand-indigo text-white" : "bg-white")}>{active && <Check className="size-3" />}</span>
                    <span className="flex-1 text-xs font-medium">{member.name}</span>
                    {member.familyGroup && <Users className="size-3.5 text-muted-foreground" />}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="bg-muted/25 p-5 sm:p-6">
            <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Presenter read</p><Badge variant="outline">{rollCall.length} entries</Badge></div>
            <div className="mt-4 space-y-2">
              {rollCall.map((member, index) => (
                <div key={member.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                  <span className="grid size-7 place-items-center rounded-full bg-brand-soft text-[10px] font-semibold text-brand-indigo">{index + 1}</span>
                  <span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{member.name}</span><span className="text-[10px] text-muted-foreground">{member.location} · {member.pronunciation}</span></span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
