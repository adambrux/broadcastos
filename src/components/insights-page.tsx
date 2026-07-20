"use client"

import { useEffect, useState } from "react"
import { BarChart3, Cake, ChevronDown, Loader2, Megaphone, MessageSquareText, Music2, Radio, Star, Users, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PastoralCarePanel } from "@/components/pastoral-care-panel"
import { studioShows, type StudioShowId } from "@/lib/studio-workspace"
import type { LinerArchiveItem } from "@/lib/presenter-hub"
import {
  listenerNameKey,
  listenerSources,
  type ListenerNote,
  type ListenerProfile,
  type ListenerShowSummary,
  type ListenerTotal,
} from "@/lib/listener-log"
import { cn } from "@/lib/utils"

type InsightsData = {
  totals: ListenerTotal[]
  shows: ListenerShowSummary[]
  sources: Record<string, number>
  allTime: { messages: number; listeners: number }
}

function showName(showId: string) {
  return studioShows[showId as StudioShowId]?.name ?? showId
}

function formatDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

const tagLabels: Record<string, string> = {
  birthday: "Birthday",
  "favourite-song": "Favourite song",
  keeper: "Keeper",
  prayer: "Prayer request",
}

export function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [liners, setLiners] = useState<LinerArchiveItem[]>([])
  const [profiles, setProfiles] = useState<ListenerProfile[]>([])
  const [notes, setNotes] = useState<ListenerNote[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState("")
  const [editBirthday, setEditBirthday] = useState("")
  const [editSong, setEditSong] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [listeners, hub, profileData] = await Promise.all([
          fetch("/api/listeners", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).catch(() => null),
          fetch("/api/presenter-hub", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).catch(() => null),
          fetch("/api/listener-profiles", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).catch(() => null),
        ])
        if (listeners) {
          setData({
            totals: listeners.totals ?? [],
            shows: listeners.shows ?? [],
            sources: listeners.sources ?? {},
            allTime: listeners.allTime ?? { messages: 0, listeners: 0 },
          })
        }
        if (hub?.liners) setLiners(hub.liners as LinerArchiveItem[])
        if (profileData) {
          setProfiles(profileData.profiles ?? [])
          setNotes(profileData.notes ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  function toggleExpanded(name: string) {
    const key = listenerNameKey(name)
    if (expanded === key) {
      setExpanded("")
      return
    }
    const profile = profiles.find((item) => item.nameKey === key)
    setEditBirthday(profile?.birthday ?? "")
    setEditSong(profile?.favouriteSong ?? "")
    setExpanded(key)
  }

  async function saveProfile(name: string) {
    setSavingProfile(true)
    try {
      const response = await fetch("/api/listener-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birthday: editBirthday, favouriteSong: editSong }),
      })
      const payload = await response.json().catch(() => null) as { profile?: ListenerProfile } | null
      if (response.ok && payload?.profile) {
        setProfiles((current) => {
          const rest = current.filter((item) => item.nameKey !== payload.profile!.nameKey)
          return [payload.profile!, ...rest]
        })
      }
    } finally {
      setSavingProfile(false)
    }
  }

  async function deleteNote(id: string) {
    const response = await fetch(`/api/listener-profiles?noteId=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => null)
    if (response?.ok) setNotes((current) => current.filter((note) => note.id !== id))
  }

  const topListeners = data?.totals.slice(0, 12) ?? []
  const recentShows = data?.shows.slice(0, 10) ?? []
  const linersByUse = [...liners].sort((a, b) => b.usageCount - a.usageCount).slice(0, 8)
  const sourceTotals = listenerSources
    .map((option) => ({ ...option, total: data?.sources[option.value] ?? 0 }))
  const maxSource = Math.max(1, ...sourceTotals.map((item) => item.total))

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[30px] bg-ink p-6 text-white shadow-card sm:p-9">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-white/10 bg-white/10 text-white"><BarChart3 />Insights</Badge>
        </div>
        <h1 className="mt-5 text-[38px] font-semibold tracking-[-0.055em] sm:text-[52px]">Who&apos;s talking back</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
          Every name you log On Air lands here: message counts per show, your regulars with their birthdays and keeper messages, where messages come from, and liner reads.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Stat icon={MessageSquareText} label="Messages all time" value={data?.allTime.messages ?? 0} />
          <Stat icon={Users} label="Listeners heard from" value={data?.allTime.listeners ?? 0} />
          <Stat icon={Megaphone} label="Liner reads recorded" value={liners.reduce((sum, liner) => sum + liner.usageCount, 0)} />
        </div>
      </header>

      <PastoralCarePanel />

      {loading ? (
        <div className="grid min-h-48 place-items-center rounded-[24px] border border-dashed text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Loading insights…</span>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <Card className="rounded-[28px] py-0 shadow-sm">
            <CardContent className="p-5 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Your regulars</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Names worth a shout-out</h2>
              <p className="mt-1 text-xs text-muted-foreground">Tap a name for their profile: birthday, favourite song and saved messages.</p>
              <div className="mt-5 space-y-2">
                {topListeners.length ? topListeners.map((listener, index) => {
                  const key = listenerNameKey(listener.name)
                  const profile = profiles.find((item) => item.nameKey === key)
                  const listenerNotes = notes.filter((note) => note.nameKey === key)
                  const open = expanded === key
                  return (
                    <div key={listener.name} className={cn("rounded-2xl border bg-white transition-shadow", open && "shadow-md ring-2 ring-brand-indigo/10")}>
                      <button type="button" onClick={() => toggleExpanded(listener.name)} className="flex w-full items-center gap-3 p-3.5 text-left">
                        <span className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold",
                          index < 3 ? "bg-ink text-white" : "bg-muted text-muted-foreground"
                        )}>{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 truncate text-sm font-semibold">
                            {listener.name}
                            {profile?.birthday && <Cake className="size-3.5 text-fuchsia-500" />}
                            {profile?.favouriteSong && <Music2 className="size-3.5 text-brand-indigo" />}
                            {listenerNotes.length > 0 && <Star className="size-3.5 text-amber-500" />}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {listener.showCount} show{listener.showCount === 1 ? "" : "s"} · last heard {formatDate(listener.lastHeard)}
                          </p>
                        </div>
                        <Badge className="bg-brand-soft text-brand-indigo">{listener.totalMessages} message{listener.totalMessages === 1 ? "" : "s"}</Badge>
                        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
                      </button>
                      {open && (
                        <div className="space-y-3 border-t px-3.5 py-3.5">
                          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                            <label className="space-y-1">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Birthday</span>
                              <Input value={editBirthday} onChange={(event) => setEditBirthday(event.target.value)} placeholder="e.g. 14 March" className="h-10 rounded-lg" />
                            </label>
                            <label className="space-y-1">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Favourite song</span>
                              <Input value={editSong} onChange={(event) => setEditSong(event.target.value)} placeholder="Song and artist" className="h-10 rounded-lg" />
                            </label>
                            <Button size="sm" className="h-10 self-end rounded-lg bg-ink text-white hover:bg-ink/90" disabled={savingProfile} onClick={() => void saveProfile(listener.name)}>
                              Save
                            </Button>
                          </div>
                          {listenerNotes.length > 0 ? (
                            <div className="space-y-1.5">
                              {listenerNotes.map((note) => (
                                <div key={note.id} className="flex items-start gap-2 rounded-xl bg-muted/25 p-2.5">
                                  <Badge variant="outline" className="shrink-0 text-[9px]">{tagLabels[note.tag] ?? note.tag}</Badge>
                                  <p className="min-w-0 flex-1 text-xs leading-5">{note.content}</p>
                                  <span className="shrink-0 text-[10px] text-muted-foreground">{note.showDate ? formatDate(note.showDate) : formatDate(note.createdAt)}</span>
                                  <button type="button" aria-label="Delete note" onClick={() => void deleteNote(note.id)} className="text-muted-foreground transition-colors hover:text-red-600">
                                    <X className="size-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Nothing saved yet. Star their messages On Air and they land here.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                }) : (
                  <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                    <Users className="mx-auto mb-3 size-6" />
                    Log listener names On Air and your regulars will build up here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="rounded-[28px] py-0 shadow-sm">
              <CardContent className="p-5 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">How they reach you</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Messages by source</h2>
                <div className="mt-5 space-y-3">
                  {sourceTotals.map((item) => (
                    <div key={item.value}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{item.label}</span>
                        <span className="font-mono text-sm font-bold">{item.total}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-brand-indigo/70" style={{ width: `${(item.total / maxSource) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] py-0 shadow-sm">
              <CardContent className="p-5 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Show by show</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Messages per show</h2>
                <div className="mt-5 space-y-2">
                  {recentShows.length ? recentShows.map((show) => (
                    <div key={`${show.showId}-${show.showDate}`} className="flex items-center gap-3 rounded-2xl border bg-white p-3.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><Radio className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{showName(show.showId)}</p>
                        <p className="text-[11px] text-muted-foreground">{formatDate(show.showDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-lg font-bold">{show.messages}</p>
                        <p className="text-[10px] text-muted-foreground">{show.names} name{show.names === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                      No shows logged yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] py-0 shadow-sm">
              <CardContent className="p-5 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Station liners</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Most read liners</h2>
                <div className="mt-5 space-y-2">
                  {linersByUse.length ? linersByUse.map((liner) => (
                    <div key={liner.id} className="flex items-center gap-3 rounded-2xl border bg-white p-3.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-fuchsia-50 text-fuchsia-700"><Megaphone className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{liner.title}</p>
                        <p className="text-[11px] text-muted-foreground">{liner.lastUsed ? `Last read ${formatDate(liner.lastUsed)}` : "Not read yet"}</p>
                      </div>
                      <Badge className="bg-fuchsia-50 text-fuchsia-700">{liner.usageCount} read{liner.usageCount === 1 ? "" : "s"}</Badge>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                      Liners appear here once a script has been imported.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
      <span className="grid size-9 place-items-center rounded-xl bg-white/10"><Icon className="size-4" /></span>
      <p className="mt-3 font-mono text-3xl font-black tracking-[-0.04em]">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-white/50">{label}</p>
    </div>
  )
}
