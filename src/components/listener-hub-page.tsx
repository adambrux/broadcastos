"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Archive,
  Cake,
  CalendarDays,
  Check,
  ChevronRight,
  Church,
  Clock3,
  Copy,
  Download,
  Edit3,
  EyeOff,
  FileHeart,
  Heart,
  History,
  MapPin,
  MessageCircle,
  Mic2,
  MoreHorizontal,
  Music2,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserRoundPlus,
  Users,
  Volume2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  listenerMetrics,
  listenerProfiles,
  newListenerQueue,
  type ListenerProfile,
} from "@/lib/listener-data"
import { cn } from "@/lib/utils"

type QueueItem = {
  id: string
  name: string
  location: string
  source: string
  pronunciation: string
  duplicate: string
  firstInteraction: string
  interactionType: string
  message: string
  show: string
  consentNeeded: boolean
}

type CongregationMember = {
  id: string
  name: string
  location: string
  pronunciation: string
  familyGroup?: string
  dateAdded: string
  latestInteraction: string
  birthday?: string
  specialOccasion?: string
  newThisWeek: boolean
  duplicateWarning?: string
  includeInRollCall: boolean
}

const metricIcons = {
  listeners: Users,
  congregation: Church,
  new: UserRoundPlus,
  birthday: Cake,
  prayer: Heart,
  testimony: Sparkles,
  songs: Music2,
  active: Star,
}

const initialMembers: CongregationMember[] = listenerProfiles
  .filter((listener) => listener.inCongregation)
  .map((listener) => ({
    id: listener.id,
    name: listener.name,
    location: listener.location,
    pronunciation: listener.pronunciation,
    familyGroup: listener.familyGroup,
    dateAdded: listener.dateAdded ?? listener.firstInteraction,
    latestInteraction: listener.lastInteraction,
    birthday: listener.birthday,
    specialOccasion: listener.specialOccasion,
    newThisWeek: listener.newThisWeek ?? false,
    duplicateWarning: listener.duplicateWarning,
    includeInRollCall: listener.includeInRollCall ?? true,
  }))

const pastoralPriorities = [
  { label: "Sensitive prayer", name: "Daniel Kwarteng", note: "University transition · private follow-up", icon: ShieldAlert },
  { label: "Consent needed", name: "Naomi Boateng", note: "Voice note · 00:18", icon: Mic2 },
  { label: "Do not mention", name: "Sister Angela Morris", note: "Prayer detail is off-air only", icon: EyeOff },
] as const

function initials(name: string) {
  return name.replace(/^The /, "").split(" ").slice(0, 2).map((part) => part[0]).join("")
}

export function ListenerHubPage() {
  const [queue, setQueue] = useState<QueueItem[]>(newListenerQueue.map((item) => ({ ...item })))
  const [members, setMembers] = useState<CongregationMember[]>(initialMembers)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [loggerOpen, setLoggerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [notice, setNotice] = useState("")
  const [search, setSearch] = useState("")
  const [familyGrouping, setFamilyGrouping] = useState(true)
  const [formName, setFormName] = useState("")
  const [formMessage, setFormMessage] = useState("")
  const [formLocation, setFormLocation] = useState("")
  const [formSource, setFormSource] = useState("WhatsApp")
  const [formShow, setFormShow] = useState("Sundays with Adam")
  const [markNew, setMarkNew] = useState(true)
  const [addDirectly, setAddDirectly] = useState(false)

  const selectedProfile = listenerProfiles.find((listener) => listener.id === profileId)
  const visibleMembers = useMemo(() => members.filter((member) => {
    const haystack = `${member.name} ${member.location} ${member.familyGroup ?? ""}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  }), [members, search])

  const rollCallMembers = useMemo(() => {
    const included = members.filter((member) => member.includeInRollCall)
    if (!familyGrouping) return included
    return [...included].sort((a, b) => (a.familyGroup ?? a.name).localeCompare(b.familyGroup ?? b.name))
  }, [familyGrouping, members])

  const newAdditions = rollCallMembers.filter((member) => member.newThisWeek)
  const establishedMembers = rollCallMembers.filter((member) => !member.newThisWeek)
  const rollCallScript = useMemo(() => [
    "Good morning to our Sunday Show Congregation.",
    establishedMembers.map((member) => `${member.name} in ${member.location}`).join("; "),
    newAdditions.length ? `And joining us this week: ${newAdditions.map((member) => `${member.name} in ${member.location}`).join("; ")}. Welcome to the family.` : "",
    "Wherever you are listening, you are part of the Congregation this morning.",
  ].filter(Boolean).join("\n\n"), [establishedMembers, newAdditions])

  const readSeconds = Math.max(15, Math.round(rollCallScript.split(/\s+/).length / 2.4))

  function addToCongregation(candidate: QueueItem) {
    if (candidate.duplicate) {
      setNotice(`Resolve the duplicate warning before adding ${candidate.name}.`)
      return
    }
    setMembers((current) => [...current, {
      id: candidate.id,
      name: candidate.name,
      location: candidate.location,
      pronunciation: candidate.pronunciation,
      dateAdded: "5 July 2026",
      latestInteraction: candidate.firstInteraction,
      newThisWeek: true,
      includeInRollCall: true,
    }])
    setQueue((current) => current.filter((item) => item.id !== candidate.id))
    setNotice(`${candidate.name} is now a permanent member of the Sunday Show Congregation.`)
  }

  function archiveCandidate(id: string) {
    const candidate = queue.find((item) => item.id === id)
    setQueue((current) => current.filter((item) => item.id !== id))
    setNotice(`${candidate?.name ?? "Listener"} archived from the new listener queue.`)
  }

  function toggleRollCall(id: string) {
    setMembers((current) => current.map((member) => (
      member.id === id ? { ...member, includeInRollCall: !member.includeInRollCall } : member
    )))
  }

  function copyRollCall() {
    void navigator.clipboard?.writeText(rollCallScript)
    setNotice("Sunday Roll Call script copied and ready for ProducerOS.")
  }

  function exportRollCall() {
    const blob = new Blob([rollCallScript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "sunday-show-roll-call.txt"
    anchor.click()
    URL.revokeObjectURL(url)
    setNotice("Sunday Roll Call exported as a text file.")
  }

  function submitInteraction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formName.trim() || !formMessage.trim()) return

    if (markNew) {
      const id = `${formName.toLowerCase().replaceAll(" ", "-")}-${Date.now()}`
      const candidate: QueueItem = {
        id,
        name: formName,
        location: formLocation || "Location not known",
        source: `1 interaction · ${formSource.toLowerCase()}`,
        pronunciation: "Add pronunciation note",
        duplicate: "",
        firstInteraction: "5 July 2026",
        interactionType: formSource,
        message: formMessage,
        show: formShow,
        consentNeeded: formSource === "Voice note",
      }
      if (addDirectly) addToCongregation(candidate)
      else setQueue((current) => [candidate, ...current])
    }

    setNotice(`${formSource} interaction from ${formName} logged for ${formShow}.`)
    setFormName("")
    setFormMessage("")
    setFormLocation("")
    setLoggerOpen(false)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="bg-brand-soft text-brand-indigo"><Church />Sundays with Adam</Badge>
            <Badge variant="outline" className="bg-white">Listener relationships</Badge>
          </div>
          <h1 className="text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">Listener Hub</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Know the people behind every message, prayer, testimony and Sunday Roll Call name.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-11 rounded-xl bg-white" onClick={() => setLoggerOpen(true)}>
            <Plus />Log interaction
          </Button>
          <Button className="primary-action h-11 rounded-xl px-5 text-white" onClick={() => {
            setActiveTab("roll-call")
            window.requestAnimationFrame(() => document.getElementById("listener-tabs")?.scrollIntoView({ behavior: "smooth" }))
          }}>
            <Church />Build Sunday Roll Call
          </Button>
        </div>
      </header>

      {notice && (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success">
          <Check className="size-4 shrink-0" />
          <span className="flex-1">{notice}</span>
          <button type="button" onClick={() => setNotice("")} className="text-xs font-semibold">Dismiss</button>
        </div>
      )}

      <section aria-labelledby="listener-overview">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">At a glance</p>
            <h2 id="listener-overview" className="mt-1 text-xl font-semibold tracking-[-0.03em]">Listener overview</h2>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">Updated from this week’s mock interactions</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {listenerMetrics.map((metric) => {
            const Icon = metricIcons[metric.kind]
            return (
              <Card key={metric.label} className="rounded-[20px] py-0 shadow-card ring-border/80">
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-indigo">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xl font-semibold tracking-[-0.04em]">{metric.value}</span>
                    <span className="block truncate text-xs font-medium">{metric.label}</span>
                    <span className="block truncate text-[10px] text-muted-foreground">{metric.note}</span>
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <Tabs id="listener-tabs" value={activeTab} onValueChange={setActiveTab} className="flex-col gap-4">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-muted/70 p-1.5 sm:w-fit">
          <TabsTrigger value="overview" className="h-9 rounded-xl px-4">Overview</TabsTrigger>
          <TabsTrigger value="queue" className="h-9 rounded-xl px-4">New queue <Badge variant="secondary">{queue.length}</Badge></TabsTrigger>
          <TabsTrigger value="congregation" className="h-9 rounded-xl px-4">Congregation</TabsTrigger>
          <TabsTrigger value="roll-call" className="h-9 rounded-xl px-4">Roll Call Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
            <QueuePanel queue={queue.slice(0, 3)} onAdd={addToCongregation} onKeep={(name) => setNotice(`${name} kept in the queue for another interaction.`)} onArchive={archiveCandidate} />
            <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
              <CardHeader className="px-5 pb-2 pt-5">
                <CardTitle className="flex items-center gap-2"><FileHeart className="size-4 text-brand-magenta" />Pastoral care</CardTitle>
                <p className="text-xs text-muted-foreground">Private cues that should shape what goes on air.</p>
              </CardHeader>
              <CardContent className="space-y-2 px-5 pb-5">
                {pastoralPriorities.map(({ label, name, note, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border bg-muted/25 p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600"><Icon className="size-4" /></span>
                      <div>
                        <Badge variant="outline" className="bg-white text-[9px]">{label}</Badge>
                        <p className="mt-2 text-xs font-semibold">{name}</p>
                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{note}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-3 rounded-2xl bg-brand-soft/70 p-4">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-indigo" />
                  <p className="text-xs leading-5 text-muted-foreground">Prayer notes stay private unless explicit permission to share has been recorded.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
            <CardHeader className="flex flex-row items-end justify-between px-5 pb-3 pt-5 sm:px-6">
              <div>
                <CardTitle>Recent listener relationships</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Open a profile for full history, preferences and pastoral notes.</p>
              </div>
              <Badge variant="outline">{listenerProfiles.length} sample records</Badge>
            </CardHeader>
            <CardContent className="divide-y divide-border/70 px-3 pb-4 sm:px-5">
              {listenerProfiles.map((listener) => (
                <button key={listener.id} type="button" onClick={() => setProfileId(listener.id)} className="grid w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/50 sm:grid-cols-[minmax(220px,1fr)_130px_140px_auto] sm:items-center">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand-indigo">{initials(listener.name)}</span>
                    <span className="min-w-0"><span className="block truncate text-xs font-semibold">{listener.name}</span><span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="size-3" />{listener.location}</span></span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">{listener.lastInteraction}</span>
                  <span className="flex flex-wrap gap-1">
                    {listener.inCongregation && <Badge className="bg-brand-soft text-[9px] text-brand-indigo">Congregation</Badge>}
                    {listener.sensitive && <Badge className="bg-rose-50 text-[9px] text-rose-700">Sensitive</Badge>}
                  </span>
                  <ChevronRight className="hidden size-4 text-muted-foreground sm:block" />
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <QueuePanel queue={queue} onAdd={addToCongregation} onKeep={(name) => setNotice(`${name} kept in the queue for another interaction.`)} onArchive={archiveCandidate} expanded />
        </TabsContent>

        <TabsContent value="congregation">
          <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
            <CardHeader className="space-y-4 px-5 pb-3 pt-5 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Church className="size-4 text-brand-indigo" />Sunday Show Congregation</CardTitle>
                  <p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted-foreground">Permanent and cumulative. Members stay unless manually removed; the weekly toggle only controls this Sunday’s spoken Roll Call.</p>
                </div>
                <Badge className="w-fit bg-brand-soft text-brand-indigo">1,284 permanent members</Badge>
              </div>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, location or family…" className="h-10 rounded-xl bg-white pl-9" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-5 sm:px-5">
              {visibleMembers.map((member) => (
                <div key={member.id} className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[minmax(220px,1.2fr)_1fr_1fr_auto] md:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand-indigo">{initials(member.name)}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-xs font-semibold">{member.name}</p>
                        {member.newThisWeek && <Badge className="bg-amber-50 text-[9px] text-amber-700">New this week</Badge>}
                        {member.duplicateWarning && <Badge className="bg-rose-50 text-[9px] text-rose-700">Duplicate warning</Badge>}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="size-3" />{member.location}{member.familyGroup ? ` · ${member.familyGroup}` : ""}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Pronunciation</p>
                    <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px]"><Volume2 className="size-3 text-brand-indigo" />{member.pronunciation}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Relationship</p>
                    <p className="mt-1 text-[10px]">{member.dateAdded} · latest {member.latestInteraction}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {member.birthday && member.birthday !== "Not known" && <Badge variant="outline" className="bg-white text-[9px]"><Cake />Birthday</Badge>}
                      {member.specialOccasion && <Badge variant="outline" className="bg-white text-[9px]"><Sparkles />Occasion</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className="text-[10px] text-muted-foreground">Include</span>
                    <Switch checked={member.includeInRollCall} onCheckedChange={() => toggleRollCall(member.id)} aria-label={`Include ${member.name} in Roll Call`} />
                    <Button variant="ghost" size="icon-sm" onClick={() => setProfileId(member.id)} aria-label={`Open ${member.name} profile`}><MoreHorizontal /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roll-call">
          <RollCallBuilder
            members={rollCallMembers}
            newAdditions={newAdditions}
            familyGrouping={familyGrouping}
            onFamilyGrouping={setFamilyGrouping}
            script={rollCallScript}
            readSeconds={readSeconds}
            onToggle={toggleRollCall}
            onCopy={copyRollCall}
            onExport={exportRollCall}
          />
        </TabsContent>
      </Tabs>

      <Sheet open={Boolean(profileId)} onOpenChange={(open) => !open && setProfileId(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl" side="right">
          {selectedProfile ? <ListenerProfileContent listener={selectedProfile} onNotice={setNotice} onClose={() => setProfileId(null)} /> : (
            <div className="p-6 text-sm text-muted-foreground">Profile details will be available after this mock listener is saved.</div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={loggerOpen} onOpenChange={setLoggerOpen}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl" side="right">
          <SheetHeader className="border-b p-6">
            <SheetTitle className="flex items-center gap-2 text-xl"><MessageCircle className="size-5 text-brand-indigo" />Log listener interaction</SheetTitle>
            <SheetDescription>Paste or enter a WhatsApp, text, call or voice-note interaction.</SheetDescription>
          </SheetHeader>
          <form onSubmit={submitInteraction} className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Listener name"><Input value={formName} onChange={(event) => setFormName(event.target.value)} required placeholder="e.g. Ruth Adebayo" /></Field>
              <Field label="Location"><Input value={formLocation} onChange={(event) => setFormLocation(event.target.value)} placeholder="Town or city" /></Field>
              <Field label="Show">
                <StyledSelect value={formShow} onChange={setFormShow} options={["Sundays with Adam", "Afternoons with Adam", "Saturday Breakfast"]} />
              </Field>
              <Field label="Interaction source">
                <StyledSelect value={formSource} onChange={setFormSource} options={["WhatsApp", "Text", "Voice note", "Call", "Song request", "Prayer request", "Testimony"]} />
              </Field>
              <Field label="Date and time"><Input type="datetime-local" defaultValue="2026-07-05T09:31" /></Field>
              <Field label="Gender if known">
                <StyledSelect value="Not known" onChange={() => undefined} options={["Not known", "Woman", "Man", "Non-binary", "Prefer not to say"]} />
              </Field>
            </div>
            <Field label="Message">
              <textarea value={formMessage} onChange={(event) => setFormMessage(event.target.value)} required rows={5} placeholder="Paste the listener’s message here…" className="w-full resize-none rounded-xl border border-input bg-white px-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Song request"><Input placeholder="Song · artist" /></Field>
              <Field label="Birthday / occasion"><Input placeholder="Date and occasion" /></Field>
            </div>
            <div className="space-y-3 rounded-2xl bg-muted/50 p-4">
              <ToggleRow label="Mark as new listener" note="Adds them to the review queue." checked={markNew} onCheckedChange={setMarkNew} />
              <ToggleRow label="Add to Congregation" note="Permanent and cumulative membership." checked={addDirectly} onCheckedChange={setAddDirectly} />
            </div>
            {formSource === "Voice note" && <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800"><Mic2 className="mt-0.5 size-4 shrink-0" />Consent must be recorded before this voice note can be aired.</div>}
            <Button type="submit" className="primary-action h-11 w-full rounded-xl text-white">Save interaction</Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function QueuePanel({ queue, onAdd, onKeep, onArchive, expanded = false }: { queue: QueueItem[]; onAdd: (item: QueueItem) => void; onKeep: (name: string) => void; onArchive: (id: string) => void; expanded?: boolean }) {
  return (
    <Card className="rounded-[22px] py-0 shadow-card ring-border/80">
      <CardHeader className="flex flex-row items-start justify-between px-5 pb-3 pt-5 sm:px-6">
        <div><CardTitle className="flex items-center gap-2"><UserRoundPlus className="size-4 text-brand-magenta" />New Listener Queue</CardTitle><p className="mt-1.5 text-xs text-muted-foreground">People who have interacted but are not permanent Congregation members yet.</p></div>
        <Badge variant="outline">{queue.length}</Badge>
      </CardHeader>
      <CardContent className={cn("grid gap-3 px-5 pb-5 sm:px-6", expanded && "xl:grid-cols-2")}>
        {queue.map((listener) => (
          <article key={listener.id} className={cn("rounded-2xl border p-4", listener.duplicate ? "border-amber-200 bg-amber-50/60" : "bg-white")}>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand-indigo">{initials(listener.name)}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{listener.name}</h3>
                  <Badge variant="secondary" className="text-[9px]">{listener.interactionType}</Badge>
                  {listener.consentNeeded && <Badge className="bg-amber-50 text-[9px] text-amber-700"><Mic2 />Consent needed</Badge>}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="size-3" />{listener.location}</span><span>{listener.firstInteraction}</span><span>{listener.show}</span></p>
              </div>
            </div>
            <p className="mt-3 rounded-xl bg-muted/55 p-3 text-xs leading-5">“{listener.message}”</p>
            {listener.duplicate && <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-100/70 p-3 text-xs font-medium text-amber-900"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{listener.duplicate}</div>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" disabled={Boolean(listener.duplicate)} onClick={() => onAdd(listener)} className={cn("rounded-xl", !listener.duplicate && "primary-action text-white")}><Church />Add to Congregation</Button>
              <Button size="sm" variant="outline" onClick={() => onKeep(listener.name)} className="rounded-xl bg-white">Keep in queue</Button>
              <Button size="sm" variant="ghost" onClick={() => onArchive(listener.id)} className="rounded-xl text-muted-foreground"><Archive />Archive</Button>
            </div>
          </article>
        ))}
        {queue.length === 0 && <div className="rounded-2xl bg-muted/50 p-10 text-center"><Check className="mx-auto size-5 text-success" /><p className="mt-3 text-sm font-medium">Queue cleared</p><p className="mt-1 text-xs text-muted-foreground">New interactions will appear here.</p></div>}
      </CardContent>
    </Card>
  )
}

function RollCallBuilder({ members, newAdditions, familyGrouping, onFamilyGrouping, script, readSeconds, onToggle, onCopy, onExport }: { members: CongregationMember[]; newAdditions: CongregationMember[]; familyGrouping: boolean; onFamilyGrouping: (value: boolean) => void; script: string; readSeconds: number; onToggle: (id: string) => void; onCopy: () => void; onExport: () => void }) {
  return (
    <Card className="overflow-hidden rounded-[24px] py-0 shadow-card ring-border/80">
      <CardHeader className="border-b bg-ink px-5 py-5 text-white sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="flex items-center gap-2"><Church className="size-4 text-brand-magenta" />Sunday Roll Call Builder</CardTitle><p className="mt-1.5 text-xs text-white/50">Permanent membership remains unchanged when a name is excluded from this week’s read.</p></div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/10 text-white"><Clock3 />{readSeconds >= 60 ? `${Math.floor(readSeconds / 60)}m ${readSeconds % 60}s` : `${readSeconds}s`} estimated</Badge>
            <Button size="sm" onClick={onCopy} className="bg-white text-ink hover:bg-white/90"><Copy />Copy script</Button>
            <Button size="sm" variant="outline" onClick={onExport} className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"><Download />Export</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid p-0 xl:grid-cols-[.85fr_1.15fr]">
        <div className="border-b p-5 xl:border-b-0 xl:border-r sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold">Permanent Congregation</p><p className="mt-1 text-[10px] text-muted-foreground">{members.length} included in this mock read</p></div>
            <ToggleRow label="Family grouping" note="Keep households together." checked={familyGrouping} onCheckedChange={onFamilyGrouping} compact />
          </div>
          <div className="mt-4 space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 rounded-xl border bg-white p-3">
                <button type="button" onClick={() => onToggle(member.id)} className="grid size-5 shrink-0 place-items-center rounded-md bg-brand-indigo text-white" aria-label={`Exclude ${member.name} from Roll Call`}><Check className="size-3" /></button>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{member.name}</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{member.familyGroup ?? member.location} · {member.pronunciation}</p></div>
                {member.newThisWeek && <Badge className="bg-amber-50 text-[9px] text-amber-700">New</Badge>}
                {member.duplicateWarning && <AlertTriangle className="size-4 text-amber-600" />}
              </div>
            ))}
          </div>
          {newAdditions.length > 0 && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><span className="font-semibold">New additions read separately:</span> {newAdditions.map((member) => member.name).join(", ")}</div>}
        </div>
        <div className="bg-[#fafafd] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-indigo">Presenter-ready script</p><p className="mt-1 text-xs text-muted-foreground">Titles, family groups and pronunciation notes are preserved in the source list.</p></div>
            <Badge variant="outline" className="bg-white">{members.length} names</Badge>
          </div>
          <div className="mt-4 whitespace-pre-line rounded-2xl border bg-white p-5 text-base font-medium leading-8 shadow-sm">{script}</div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <BuilderRule icon={Users} label="Families grouped" value={familyGrouping ? "Preserved" : "Off"} />
            <BuilderRule icon={Volume2} label="Pronunciation" value="Notes attached" />
            <BuilderRule icon={AlertTriangle} label="Duplicates" value="Flagged before air" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ListenerProfileContent({ listener, onNotice, onClose }: { listener: ListenerProfile; onNotice: (notice: string) => void; onClose: () => void }) {
  return (
    <>
      <SheetHeader className="soft-gradient border-b p-6 pr-14">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-indigo text-lg font-semibold text-white">{initials(listener.name)}</span>
          <div><SheetTitle className="text-2xl tracking-[-0.04em]">{listener.name}</SheetTitle><SheetDescription className="mt-1 flex items-center gap-1.5"><MapPin className="size-3.5" />{listener.location} · {listener.gender}</SheetDescription></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {listener.inCongregation && <Badge className="bg-brand-soft text-brand-indigo"><Church />Congregation</Badge>}
          {listener.sensitive && <Badge className="bg-rose-50 text-rose-700"><ShieldAlert />Sensitive information</Badge>}
          {listener.consentVoiceNote === false && <Badge className="bg-amber-50 text-amber-700"><Mic2 />Voice-note consent needed</Badge>}
          {listener.doNotMention && <Badge className="bg-slate-100 text-slate-700"><EyeOff />Do not mention publicly</Badge>}
        </div>
      </SheetHeader>
      <div className="space-y-6 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <ProfileFact icon={Cake} label="Birthday" value={listener.birthday} />
          <ProfileFact icon={Sparkles} label="Special occasion" value={listener.specialOccasion} />
          <ProfileFact icon={CalendarDays} label="First interaction" value={listener.firstInteraction} />
          <ProfileFact icon={MessageCircle} label="Last interaction" value={listener.lastInteraction} />
        </div>
        <ProfileSection icon={Music2} title="Music & requests">
          <TagGroup label="Favourite artists" items={listener.favouriteArtists} />
          <TagGroup label="Favourite songs" items={listener.favouriteSongs} />
          <TagGroup label="Song requests" items={listener.songRequests} />
        </ProfileSection>
        <ProfileSection icon={Heart} title="Prayer & testimony">
          <TagGroup label="Prayer requests" items={listener.prayerRequests} sensitive={listener.sensitive} />
          <TagGroup label="Testimonies" items={listener.testimonies} />
        </ProfileSection>
        <ProfileSection icon={History} title="Interaction history">
          <div className="divide-y">
            {listener.history.map((entry) => <div key={`${entry.date}-${entry.note}`} className="grid gap-1 py-3 sm:grid-cols-[55px_90px_1fr]"><span className="font-mono text-[10px] text-muted-foreground">{entry.date}</span><Badge variant="secondary" className="w-fit text-[9px]">{entry.channel}</Badge><span className="text-xs">{entry.note}</span></div>)}
          </div>
        </ProfileSection>
        <ProfileSection icon={Church} title="Relationship details">
          <p className="text-xs leading-5"><span className="font-semibold">Shows:</span> {listener.shows?.join(", ") ?? "Sundays with Adam"}</p>
          <p className="mt-2 text-xs leading-5"><span className="font-semibold">Notes:</span> {listener.notes ?? "No additional notes."}</p>
          <p className="mt-2 text-xs leading-5"><span className="font-semibold">Pronunciation:</span> {listener.pronunciation}</p>
        </ProfileSection>
        <div className="flex flex-wrap gap-2 border-t pt-5">
          <Button variant="outline" onClick={() => onNotice(`Editing ${listener.name} is ready for the future database workflow.`)}><Edit3 />Edit details</Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => { onNotice(`${listener.name} removed from this mock view. No real record was deleted.`); onClose() }}><Trash2 />Remove record</Button>
        </div>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>{children}</label>
}

function StyledSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20">{options.map((option) => <option key={option}>{option}</option>)}</select>
}

function ToggleRow({ label, note, checked, onCheckedChange, compact = false }: { label: string; note: string; checked: boolean; onCheckedChange: (value: boolean) => void; compact?: boolean }) {
  return <div className={cn("flex items-center justify-between gap-4", compact && "min-w-[180px]")}><div><p className="text-xs font-medium">{label}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{note}</p></div><Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} /></div>
}

function ProfileFact({ icon: Icon, label, value }: { icon: typeof Cake; label: string; value: string }) {
  return <div className="rounded-xl border bg-white p-4"><p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"><Icon className="size-3.5 text-brand-indigo" />{label}</p><p className="mt-2 text-xs font-medium leading-5">{value}</p></div>
}

function ProfileSection({ icon: Icon, title, children }: { icon: typeof Heart; title: string; children: React.ReactNode }) {
  return <section><h3 className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-brand-indigo" />{title}</h3><div className="mt-3 rounded-2xl border bg-muted/20 p-4">{children}</div></section>
}

function TagGroup({ label, items, sensitive = false }: { label: string; items: readonly string[]; sensitive?: boolean }) {
  return <div className="mt-3 first:mt-0"><p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{sensitive && <ShieldAlert className="size-3 text-rose-600" />}{label}</p><div className="mt-2 flex flex-wrap gap-2">{items.map((item) => <span key={item} className={cn("rounded-lg px-3 py-2 text-xs leading-5", sensitive ? "bg-rose-50 text-rose-800" : "bg-white")}>{item}</span>)}</div></div>
}

function BuilderRule({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="rounded-xl border bg-white p-3"><Icon className="size-3.5 text-brand-indigo" /><p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p><p className="mt-1 text-xs font-semibold">{value}</p></div>
}
