"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Cake,
  CalendarDays,
  Church,
  Heart,
  MapPin,
  MessageCircle,
  Mic2,
  Music2,
  Plus,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { listenerProfiles } from "@/lib/listener-data"
import { cn } from "@/lib/utils"

type Filter = "all" | "congregation" | "new"

export function ListenerHubPage() {
  const [selectedId, setSelectedId] = useState(listenerProfiles[0].id)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const selected = listenerProfiles.find((listener) => listener.id === selectedId) ?? listenerProfiles[0]

  const visibleListeners = useMemo(() => listenerProfiles.filter((listener) => {
    const matchesQuery = `${listener.name} ${listener.location}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === "all" || (filter === "congregation" ? listener.inCongregation : listener.newListener)
    return matchesQuery && matchesFilter
  }), [filter, query])

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-indigo">Audience relationships</p>
          <h1 className="text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">Listener Hub</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">Know the people behind every message, request, prayer and testimony.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-11 rounded-xl bg-white"><Plus />New listener</Button>
          <Button asChild className="primary-action h-11 rounded-xl px-5 text-white">
            <Link href="/listeners/congregation"><Church />Sunday Show Congregation</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Known listeners", "1,486", Users, "Across all shows"],
          ["Congregation", "1,284", Church, "Permanent roll call"],
          ["New this month", "36", Sparkles, "Awaiting relationship review"],
        ].map(([label, value, Icon, note]) => (
          <Card key={label as string} className="rounded-[20px] py-0 shadow-card ring-border/80">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Icon className="size-4" /></span>
              <span><span className="block text-2xl font-semibold tracking-[-0.04em]">{value as string}</span><span className="block text-xs font-medium">{label as string}</span><span className="text-[10px] text-muted-foreground">{note as string}</span></span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[370px_1fr]">
        <Card className="h-fit rounded-[22px] py-0 shadow-card ring-border/80">
          <CardHeader className="space-y-4 px-5 pb-3 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle>Listener profiles</CardTitle>
              <Badge variant="outline">{visibleListeners.length}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or location…" className="h-10 rounded-xl pl-9" />
            </div>
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {([["all", "All"], ["congregation", "Congregation"], ["new", "New"]] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setFilter(value)} className={cn("flex-1 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors", filter === value ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}>{label}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-1 px-3 pb-4">
            {visibleListeners.map((listener) => (
              <button
                key={listener.id}
                type="button"
                onClick={() => setSelectedId(listener.id)}
                className={cn("flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors", selected.id === listener.id ? "bg-brand-soft" : "hover:bg-muted/60")}
              >
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold", selected.id === listener.id ? "bg-brand-indigo text-white" : "bg-muted text-muted-foreground")}>
                  {listener.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{listener.name}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="size-3" />{listener.location} · {listener.lastInteraction}</span>
                </span>
                {listener.newListener ? <Badge className="bg-amber-50 text-[9px] text-amber-700">New</Badge> : listener.inCongregation ? <Church className="size-4 text-brand-indigo" /> : null}
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="soft-gradient rounded-[22px] border-brand-indigo/10 py-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 place-items-center rounded-2xl bg-brand-indigo text-lg font-semibold text-white">{selected.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}</span>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-[-0.035em]">{selected.name}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" />{selected.location} · {selected.gender}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.inCongregation && <Badge className="bg-brand-soft text-brand-indigo"><Church />Congregation</Badge>}
                  {selected.newListener && <Badge className="bg-amber-50 text-amber-700"><Sparkles />New listener</Badge>}
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ProfileFact icon={Cake} label="Birthday" value={selected.birthday} />
                <ProfileFact icon={Star} label="Special occasion" value={selected.specialOccasion} />
                <ProfileFact icon={CalendarDays} label="First interaction" value={selected.firstInteraction} />
                <ProfileFact icon={MessageCircle} label="Last interaction" value={selected.lastInteraction} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <ProfileCollection icon={Music2} title="Music preferences" sections={[
              ["Favourite songs", selected.favouriteSongs],
              ["Favourite artists", selected.favouriteArtists],
              ["Song requests", selected.songRequests],
            ]} />
            <ProfileCollection icon={Heart} title="Faith & life" sections={[
              ["Prayer requests", selected.prayerRequests],
              ["Testimonies", selected.testimonies],
            ]} />
          </div>

          <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
            <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-5">
              <CardTitle className="flex items-center gap-2"><Mic2 className="size-4 text-brand-indigo" />Interaction history</CardTitle>
              <Button variant="outline" size="sm">Add interaction</Button>
            </CardHeader>
            <CardContent className="divide-y divide-border/70 px-6 pb-5">
              {selected.history.map((entry) => (
                <div key={`${entry.date}-${entry.note}`} className="grid gap-2 py-3.5 sm:grid-cols-[60px_110px_1fr] sm:items-center">
                  <span className="font-mono text-[10px] text-muted-foreground">{entry.date}</span>
                  <Badge variant="secondary" className="w-fit">{entry.channel}</Badge>
                  <span className="text-xs">{entry.note}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ProfileFact({ icon: Icon, label, value }: { icon: typeof Cake; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/65 p-4">
      <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground"><Icon className="size-3.5 text-brand-indigo" />{label}</p>
      <p className="mt-2 text-xs font-medium leading-5">{value}</p>
    </div>
  )
}

function ProfileCollection({ icon: Icon, title, sections }: { icon: typeof Music2; title: string; sections: [string, readonly string[]][] }) {
  return (
    <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
      <CardHeader className="px-6 pb-2 pt-5"><CardTitle className="flex items-center gap-2"><Icon className="size-4 text-brand-magenta" />{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {sections.map(([label, items]) => (
          <div key={label}>
            <p className="text-[10px] font-medium uppercase tracking-[0.11em] text-muted-foreground">{label}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {items.map((item) => <span key={item} className="rounded-lg bg-muted px-3 py-2 text-xs leading-5">{item}</span>)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
