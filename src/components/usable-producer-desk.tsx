"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardPaste,
  Cloud,
  Clock3,
  CopyPlus,
  Download,
  FileText,
  FilePlus2,
  GripVertical,
  KeyRound,
  ListChecks,
  MessageSquareText,
  MonitorPlay,
  Music2,
  Plus,
  RefreshCcw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LinkFramework } from "@/components/link-framework"
import { NowOnAirBanner } from "@/components/now-on-air-banner"
import { StudioModeSwitch } from "@/components/studio-mode-switch"
import { AudioLevelMeter, LiveStatusPill, StudioAmbient, StudioSignalStrip } from "@/components/studio-motion"
import {
  weekStartFromDate,
  friendlyImportTitle,
  type LinerArchiveItem,
} from "@/lib/presenter-hub"
import {
  createBlankWorkspace,
  createEmptyStudioItem,
  createTemplateWorkspace,
  getContextFirstReadiness,
  parseListenerMessages,
  saveStudioWorkspace,
  studioShows,
  useStudioWorkspace,
  type StudioItem,
  type StudioShowId,
  type StudioWorkspace,
} from "@/lib/studio-workspace"
import { parseShowPlanImport } from "@/lib/show-plan-import"
import { cn } from "@/lib/utils"

const fieldClass = "min-h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-brand-indigo/40 focus:ring-2 focus:ring-brand-indigo/10"
const textareaClass = `${fieldClass} resize-y py-3 leading-6`
const showPlanPlaceholder = `# SHOW PLAN
Show:
Afternoons with Adam

# HOUR 1

Hour name:
Afternoon Conversation

Feature:
Afternoon Conversation

## LINK 1

Title:
Welcome / Set up Afternoon Conversation

Type:
Link

Feature:
Afternoon Conversation

Listener-led:
No

Context:
You’re listening to Afternoons with Adam on Premier Gospel...

Recap:
If you’ve just joined us...

The Moment:
One clear idea for this link...

The Moment · If Responses:
Use this instead of The Moment when the link depends on listener replies.

The Moment · If No Responses:
A complete, equally good version if no messages have arrived yet.

Call To Action:
One clear action only.

Tease Ahead:
Why should the listener stay?

Producer Notes:

Station Requirement:
Station ID · Presenter ID · Time check

What Comes Next:`

const cloudKeyStorageKey = "broadcastos-cloud-save-key"

type CloudSaveStatus = {
  databaseConfigured: boolean
  privateKeyConfigured: boolean
}

type CloudSessionMeta = {
  id: string
  title: string
  show_id: string
  show_date: string
  created_at: string
  updated_at: string
  item_count: number
}

function isLinerLink(item: Pick<StudioItem, "title" | "script">) {
  return /liner link|station liner|\bP[12]\b/i.test(item.title) || /\[LINER STARTS HERE/i.test(item.script)
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
        {label}{hint && <span className="normal-case tracking-normal">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

export function UsableProducerDesk() {
  const workspace = useStudioWorkspace()
  const [selectedId, setSelectedId] = useState("")
  const [draggingId, setDraggingId] = useState("")
  const [pasteValue, setPasteValue] = useState("")
  const [showPlanOpen, setShowPlanOpen] = useState(false)
  const [showPlanValue, setShowPlanValue] = useState("")
  const [notice, setNotice] = useState("")
  const [cloudKey, setCloudKey] = useState("")
  const [cloudTitle, setCloudTitle] = useState("")
  const [cloudSessions, setCloudSessions] = useState<CloudSessionMeta[]>([])
  const [cloudStatus, setCloudStatus] = useState<CloudSaveStatus | null>(null)
  const [cloudBusy, setCloudBusy] = useState(false)
  const [cloudMessage, setCloudMessage] = useState("")

  const selected = useMemo(
    () => workspace.items.find((item) => item.id === selectedId) ?? workspace.items[0],
    [selectedId, workspace.items]
  )
  const importedPlan = useMemo(() => parseShowPlanImport(showPlanValue), [showPlanValue])

  useEffect(() => {
    const storedKey = window.localStorage.getItem(cloudKeyStorageKey) ?? ""
    setCloudKey(storedKey)

    async function loadInitialCloudSessions() {
      try {
        const response = await fetch("/api/show-sessions", {
          cache: "no-store",
          headers: storedKey ? { "x-broadcastos-cloud-key": storedKey } : undefined,
        })
        const data = await response.json().catch(() => null)
        if (data?.status) setCloudStatus(data.status)
        if (response.ok && Array.isArray(data?.sessions)) setCloudSessions(data.sessions)
      } catch {
        setCloudMessage("Cloud save is not reachable yet. Local saving still works.")
      }
    }

    void loadInitialCloudSessions()
  }, [])

  function cloudHeaders(key = cloudKey) {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (key.trim()) headers["x-broadcastos-cloud-key"] = key.trim()
    return headers
  }

  function rememberCloudKey(value: string) {
    setCloudKey(value)
    window.localStorage.setItem(cloudKeyStorageKey, value)
  }

  async function refreshCloudSessions(message = "Cloud saved shows refreshed.") {
    setCloudBusy(true)
    setCloudMessage("")
    try {
      const response = await fetch("/api/show-sessions", {
        cache: "no-store",
        headers: cloudKey.trim() ? { "x-broadcastos-cloud-key": cloudKey.trim() } : undefined,
      })
      const data = await response.json().catch(() => null)
      if (data?.status) setCloudStatus(data.status)
      if (!response.ok) throw new Error(data?.error ?? "Cloud save is not available yet.")
      setCloudSessions(Array.isArray(data?.sessions) ? data.sessions : [])
      setCloudMessage(message)
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : "Cloud save is not available yet.")
    } finally {
      setCloudBusy(false)
    }
  }

  async function saveCurrentShowOnline() {
    setCloudBusy(true)
    setCloudMessage("")
    try {
      const response = await fetch("/api/show-sessions", {
        method: "POST",
        headers: cloudHeaders(),
        body: JSON.stringify({
          title: cloudTitle,
          workspace,
        }),
      })
      const data = await response.json().catch(() => null)
      if (data?.status) setCloudStatus(data.status)
      if (!response.ok) throw new Error(data?.error ?? "Could not save this show online.")
      setCloudTitle("")
      await refreshCloudSessions("Show saved online. Open this app on iPad and load it from Saved Shows.")
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : "Could not save this show online.")
    } finally {
      setCloudBusy(false)
    }
  }

  async function loadCloudSession(id: string) {
    if (workspace.items.length && !window.confirm("Replace the current local running order with this saved online show?")) return

    setCloudBusy(true)
    setCloudMessage("")
    try {
      const response = await fetch(`/api/show-sessions/${id}`, {
        cache: "no-store",
        headers: cloudKey.trim() ? { "x-broadcastos-cloud-key": cloudKey.trim() } : undefined,
      })
      const data = await response.json().catch(() => null)
      if (data?.status) setCloudStatus(data.status)
      if (!response.ok) throw new Error(data?.error ?? "Could not load this saved show.")

      const nextWorkspace = data.session.workspace as StudioWorkspace
      saveStudioWorkspace(nextWorkspace)
      setSelectedId(nextWorkspace.items?.[0]?.id ?? "")
      setCloudMessage(`${data.session.title} loaded on this device.`)
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : "Could not load this saved show.")
    } finally {
      setCloudBusy(false)
    }
  }

  async function deleteCloudSession(id: string, title: string) {
    if (!window.confirm(`Delete "${title}" from cloud saved shows?`)) return

    setCloudBusy(true)
    setCloudMessage("")
    try {
      const response = await fetch(`/api/show-sessions/${id}`, {
        method: "DELETE",
        headers: cloudKey.trim() ? { "x-broadcastos-cloud-key": cloudKey.trim() } : undefined,
      })
      const data = await response.json().catch(() => null)
      if (data?.status) setCloudStatus(data.status)
      if (!response.ok) throw new Error(data?.error ?? "Could not delete this saved show.")
      await refreshCloudSessions("Saved show deleted.")
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : "Could not delete this saved show.")
    } finally {
      setCloudBusy(false)
    }
  }

  function save(next = workspace, message = "Saved in this browser.") {
    saveStudioWorkspace(next)
    setNotice(message)
  }

  async function archiveShowPlanImport(showPlanText: string, showId: StudioShowId, messagePrefix: string) {
    if (!showPlanText.trim()) return

    try {
      const showName = studioShows[showId].name
      const weekStart = weekStartFromDate(workspace.date || new Date())
      const title = friendlyImportTitle("show-script", showName, weekStart)
      const response = await fetch("/api/presenter-hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "show-script",
          showName,
          weekStart,
          content: showPlanText,
          title,
        }),
      })
      const data = await response.json().catch(() => null) as { extractedLiners?: LinerArchiveItem[]; error?: string } | null
      if (!response.ok) throw new Error(data?.error ?? "Presenter Hub archive failed.")

      const linerCount = data?.extractedLiners?.length ?? 0
      setNotice(linerCount
        ? `${messagePrefix} Presenter Hub saved it and pulled out ${linerCount} liner${linerCount === 1 ? "" : "s"}.`
        : `${messagePrefix} Presenter Hub saved the show notes. No liners were detected.`)
    } catch {
      setNotice(`${messagePrefix} Show loaded, but Presenter Hub could not archive the liners yet.`)
    }
  }

  function setDragging(id: string) {
    setDraggingId(id)
  }

  function startTemplate(showId: StudioShowId) {
    const next = createTemplateWorkspace(showId, workspace.date, workspace.mode)
    save(next, `${studioShows[showId].name} template loaded.`)
    setSelectedId(next.items[0]?.id ?? "")
  }

  function startBlank() {
    if (workspace.items.length && !window.confirm("Clear the current running order and start blank?")) return
    save(createBlankWorkspace(workspace.showId, workspace.date, workspace.mode), "Blank running order ready.")
    setSelectedId("")
  }

  function updateItem(id: string, key: keyof StudioItem, value: string | boolean) {
    saveStudioWorkspace({
      ...workspace,
      items: workspace.items.map((item) => item.id === id ? { ...item, [key]: value } : item),
    })
  }

  function addItem() {
    const newItem = createEmptyStudioItem()
    save({ ...workspace, items: [...workspace.items, newItem] }, "New link added.")
    setSelectedId(newItem.id)
  }

  function removeItem(id: string) {
    const currentIndex = workspace.items.findIndex((item) => item.id === id)
    const nextItems = workspace.items.filter((item) => item.id !== id)
    save({ ...workspace, items: nextItems }, "Item removed.")
    setSelectedId(nextItems[Math.max(0, currentIndex - 1)]?.id ?? "")
  }

  function moveItem(id: string, direction: -1 | 1) {
    const index = workspace.items.findIndex((item) => item.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= workspace.items.length) return
    const items = [...workspace.items]
    ;[items[index], items[target]] = [items[target], items[index]]
    saveStudioWorkspace({ ...workspace, items })
  }

  function dropItem(targetId: string) {
    const sourceId = draggingId
    if (!sourceId || sourceId === targetId) {
      setDragging("")
      return
    }

    const sourceIndex = workspace.items.findIndex((item) => item.id === sourceId)
    const targetIndex = workspace.items.findIndex((item) => item.id === targetId)
    if (sourceIndex < 0 || targetIndex < 0) return

    const items = [...workspace.items]
    const [moved] = items.splice(sourceIndex, 1)
    items.splice(targetIndex, 0, moved)
    save({ ...workspace, items }, `${moved.title} moved in the running order.`)
    setDragging("")
  }

  function moveDraggedItem(targetId: string) {
    const sourceId = draggingId
    if (!sourceId || sourceId === targetId) return
    const sourceIndex = workspace.items.findIndex((item) => item.id === sourceId)
    const targetIndex = workspace.items.findIndex((item) => item.id === targetId)
    if (sourceIndex < 0 || targetIndex < 0) return

    const items = [...workspace.items]
    const [moved] = items.splice(sourceIndex, 1)
    items.splice(targetIndex, 0, moved)
    saveStudioWorkspace({ ...workspace, items })
  }

  function addMessages() {
    const messages = parseListenerMessages(pasteValue)
    if (!messages.length) return
    save({ ...workspace, messages: [...workspace.messages, ...messages] }, `${messages.length} listener message${messages.length === 1 ? "" : "s"} added.`)
    setPasteValue("")
  }

  function importShowPlan(mode: "append" | "replace") {
    if (!importedPlan.items.length) {
      setNotice("Paste a valid show plan with # HOUR and LINK sections first.")
      return
    }

    if (mode === "replace" && workspace.items.length && !window.confirm("Replace the current running order with the imported show plan?")) return

    const nextItems = mode === "append" ? [...workspace.items, ...importedPlan.items] : importedPlan.items
    const nextShowId = importedPlan.showId ?? workspace.showId

    const messagePrefix = `${importedPlan.items.length} imported link${importedPlan.items.length === 1 ? "" : "s"} ${mode === "append" ? "added" : "loaded"} from show plan.`

    save(
      {
        ...workspace,
        showId: nextShowId,
        items: nextItems,
        preShowPromo: importedPlan.preShowPromo,
      },
      messagePrefix
    )
    void archiveShowPlanImport(showPlanValue, nextShowId, messagePrefix)
    setSelectedId(importedPlan.items[0]?.id ?? "")
    setShowPlanOpen(false)
  }

  const show = studioShows[workspace.showId]
  const completed = workspace.items.filter((item) => item.done).length
  const selectedReadiness = selected ? getContextFirstReadiness(selected, show.name) : null
  const readyLinks = workspace.items.filter((item) => getContextFirstReadiness(item, show.name).ready).length
  const songRequests = workspace.messages.flatMap((message) => message.songRequests.map((request) => ({ id: `${message.id}-${request}`, request, sender: message.sender })))

  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-white shadow-card sm:p-8">
        <StudioAmbient />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/10 bg-white/10 text-white">Producer Desk</Badge>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Check />Works locally today</Badge>
              <LiveStatusPill dark label="Desk alive" />
            </div>
            <h1 className="mt-5 text-[38px] font-semibold tracking-[-0.05em] sm:text-[50px]">{show.name}</h1>
            <p className="mt-2 text-sm text-white/50">{show.schedule} · {workspace.items.length} items · {completed} done · {readyLinks} framework-ready</p>
          </div>
          <div className="flex flex-col gap-4 xl:items-end">
            <AudioLevelMeter dark className="h-9" />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="h-11 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={() => save()}>
                <Save />Save
              </Button>
              <Button asChild className="h-11 rounded-xl bg-white px-5 text-ink hover:bg-white/90">
                <Link href="/broadcast"><MonitorPlay />Open On Air</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <StudioModeSwitch />
      <NowOnAirBanner />
      <StudioSignalStrip message="Studio pulse · drag items around · framework checks update as you write" />

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="studio-card-lift rounded-[24px] border-brand-indigo/10 bg-gradient-to-br from-white to-brand-soft/35 py-0 shadow-card">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-white"><ShieldCheck className="size-5" /></span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">BroadcastOS Link Framework</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Every listener joins mid-story.</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Context first, always. Every generated presenter link now follows the same five sections across every show, feature and mode.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <LinkFramework compact />
      </section>

      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-success/15 bg-success-soft px-4 py-3 text-sm text-success">
          <Check className="size-4" />{notice}
          <button type="button" className="ml-auto text-xs font-semibold" onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}

      <Card className="studio-card-lift overflow-hidden rounded-[24px] border-brand-indigo/10 bg-gradient-to-br from-white via-white to-brand-soft/35 py-0 shadow-card">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-ink text-white"><Cloud />Cloud Save V1</Badge>
                <Badge className={cn(cloudStatus?.databaseConfigured ? "bg-success-soft text-success" : "bg-amber-100 text-amber-800")}>
                  {cloudStatus?.databaseConfigured ? "Database connected" : "Database not confirmed"}
                </Badge>
                <Badge variant="outline">{cloudStatus?.privateKeyConfigured ? "Private key protected" : "No private key set"}</Badge>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Save this show online and open it on any device.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use this when you’ve imported or built a show on your Mac and want the same running order available on iPad or iPhone.
                Local browser saving still works as a fallback.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => refreshCloudSessions()} disabled={cloudBusy}>
                <RefreshCcw />Refresh saved shows
              </Button>
              <Button className="primary-action rounded-xl text-white" onClick={saveCurrentShowOnline} disabled={cloudBusy || !workspace.items.length || Boolean(cloudStatus?.privateKeyConfigured && !cloudKey.trim())}>
                <Save />Save online
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.65fr)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cloud save title" hint="Optional">
                <Input
                  value={cloudTitle}
                  onChange={(event) => setCloudTitle(event.target.value)}
                  placeholder={`${show.name} · ${workspace.date || "today"}`}
                />
              </Field>
              <Field label="Private cloud key" hint="Enter once per device">
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={cloudKey}
                    onChange={(event) => rememberCloudKey(event.target.value)}
                    placeholder={cloudStatus?.privateKeyConfigured ? "Required by Vercel" : "Optional"}
                    className="pl-9"
                  />
                </div>
              </Field>
            </div>

            <div className="rounded-2xl border bg-white/70 p-4 text-xs leading-5 text-muted-foreground">
              <p className="font-semibold text-foreground">How this works</p>
              <p className="mt-1">
                Save online here, then open BroadcastOS on another device, enter the same key if needed, refresh saved shows, and load the session.
              </p>
              {cloudMessage && <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 font-semibold text-brand-indigo">{cloudMessage}</p>}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Saved Shows</p>
                <p className="mt-1 text-xs text-muted-foreground">{cloudSessions.length ? `${cloudSessions.length} online session${cloudSessions.length === 1 ? "" : "s"} available` : "No online sessions loaded yet"}</p>
              </div>
            </div>
            {cloudSessions.length > 0 ? (
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {cloudSessions.map((session) => (
                  <div key={session.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{session.title}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">{session.show_date} · {session.item_count} items · updated {new Date(session.updated_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[9px]">{session.show_id}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" className="rounded-xl bg-ink text-white hover:bg-ink/90" onClick={() => loadCloudSession(session.id)} disabled={cloudBusy}>
                        <Download />Load on this device
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl text-destructive" onClick={() => deleteCloudSession(session.id, session.title)} disabled={cloudBusy}>
                        <Trash2 />Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed bg-white/70 p-5 text-center text-sm text-muted-foreground">
                Save the current running order online, or refresh after saving from another device.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="studio-card-lift rounded-[24px] py-0 shadow-card">
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Show">
              <select
                className={fieldClass}
                value={workspace.showId}
                onChange={(event) => save({ ...workspace, showId: event.target.value as StudioShowId }, "Show changed. Choose a template or keep this running order.")}
              >
                {Object.entries(studioShows).map(([id, details]) => <option key={id} value={id}>{details.name}</option>)}
              </select>
            </Field>
            <Field label="Broadcast date">
              <Input type="date" value={workspace.date} onChange={(event) => saveStudioWorkspace({ ...workspace, date: event.target.value })} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setShowPlanOpen((open) => !open)}><FileText />Import show plan</Button>
            <Button variant="outline" className="rounded-xl" onClick={startBlank}><FilePlus2 />Start blank</Button>
            <Button className="primary-action rounded-xl text-white" onClick={() => startTemplate(workspace.showId)}><CopyPlus />Load show template</Button>
          </div>
        </CardContent>
      </Card>

      {showPlanOpen && (
        <section className="rounded-[26px] border bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Import Show Plan</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Paste the full Show Plan</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                BroadcastOS reads # HOUR headings and LINK 1, LINK 2, LINK 3 sections. It does not split by timestamps.
              </p>
            </div>
            <Badge className="w-fit bg-brand-soft text-brand-indigo"><ListChecks />Preview before import</Badge>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-3">
              <Field label="Show plan text" hint="Uses # HOUR and LINK headings">
                <textarea
                  rows={18}
                  className={`${textareaClass} font-mono text-xs leading-5`}
                  value={showPlanValue}
                  onChange={(event) => setShowPlanValue(event.target.value)}
                  placeholder={showPlanPlaceholder}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button className="primary-action rounded-xl text-white" disabled={!importedPlan.items.length} onClick={() => importShowPlan("replace")}>
                  <FileText />Replace running order
                </Button>
                <Button variant="outline" className="rounded-xl" disabled={!importedPlan.items.length} onClick={() => importShowPlan("append")}>
                  <Plus />Append to show
                </Button>
                <Button variant="ghost" className="rounded-xl" onClick={() => setShowPlanValue("")}>Clear</Button>
              </div>
            </div>

            <aside className="space-y-3">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Import preview</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-2xl font-semibold">{importedPlan.items.length}</p>
                    <p className="text-[10px] text-muted-foreground">links found</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-2xl font-semibold">{new Set(importedPlan.items.map((item) => item.hour)).size}</p>
                    <p className="text-[10px] text-muted-foreground">hours</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-2xl font-semibold">{importedPlan.warnings.length}</p>
                    <p className="text-[10px] text-muted-foreground">warnings</p>
                  </div>
                </div>
                {showPlanValue && (
                  <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs text-muted-foreground">
                    Pre-show promo: <strong className="text-foreground">
                      {importedPlan.preShowPromo.whatsappStatus || importedPlan.preShowPromo.videoScript ? "Detected" : "Not found yet"}
                    </strong>
                  </p>
                )}
                {importedPlan.showId && (
                  <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs text-muted-foreground">
                    Detected show: <strong className="text-foreground">{studioShows[importedPlan.showId].name}</strong>
                  </p>
                )}
              </div>

              {importedPlan.warnings.length > 0 && (
                <div className="max-h-48 overflow-auto rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                  <p className="font-semibold">Needs attention</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {importedPlan.warnings.slice(0, 12).map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                  {importedPlan.warnings.length > 12 && <p className="mt-2 font-semibold">+ {importedPlan.warnings.length - 12} more warnings</p>}
                </div>
              )}

              {showPlanValue && !importedPlan.items.length && (
                <div className="rounded-2xl border border-destructive/20 bg-red-50 p-4 text-xs leading-5 text-destructive">
                  <p className="font-semibold">No importable links found yet.</p>
                  <p className="mt-1">
                    Make sure the pasted plan has hour headings like <strong>HOUR 1</strong> and link headings like <strong>LINK 1</strong>.
                    The import buttons unlock once BroadcastOS finds at least one link.
                  </p>
                </div>
              )}

              <div className="max-h-[420px] space-y-2 overflow-auto">
                {importedPlan.items.slice(0, 18).map((item, index) => (
                  <div key={item.id} className="rounded-2xl border bg-white p-3.5">
                    <div className="flex items-start gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-soft font-mono text-[10px] font-semibold text-brand-indigo">{String(index + 1).padStart(2, "0")}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 truncate text-[10px] text-muted-foreground">{item.hour} · {item.featureId}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-[9px]">{item.type}</Badge>
                          {item.listenerLed && <Badge className="bg-violet-50 text-violet-700 text-[9px]">Response Gate</Badge>}
                          {item.momentNoResponses && <Badge className="bg-success-soft text-success text-[9px]">No-response moment</Badge>}
                          {isLinerLink(item) && <Badge className="bg-fuchsia-50 text-fuchsia-700 text-[9px]">Liner</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {importedPlan.items.length > 18 && (
                  <p className="rounded-2xl border border-dashed p-3 text-center text-xs text-muted-foreground">
                    + {importedPlan.items.length - 18} more links will import.
                  </p>
                )}
                {!showPlanValue && (
                  <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Paste a show plan to preview the links here.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      )}

      {(workspace.preShowPromo.whatsappStatus || workspace.preShowPromo.videoScript) && (
        <section className="grid gap-4 rounded-[26px] border bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Pre-show promo · WhatsApp status</p>
            <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-brand-soft/45 p-4 text-sm leading-6 text-muted-foreground">
              {workspace.preShowPromo.whatsappStatus || "No WhatsApp status saved yet."}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">30-second video/story script</p>
            <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-muted/25 p-4 text-sm leading-6 text-muted-foreground">
              {workspace.preShowPromo.videoScript || "No video/story script saved yet."}
            </p>
          </div>
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Today’s show</p>
              <h2 className="mt-1 text-xl font-semibold">Running order</h2>
              <p className="mt-1 text-[10px] text-muted-foreground">Drag the grip to reorder · arrow controls remain available</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl" onClick={addItem}><Plus />Add item</Button>
          </div>
          {workspace.items.length === 0 ? (
            <button type="button" onClick={addItem} className="w-full rounded-[22px] border border-dashed bg-white p-8 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand-indigo"><Plus className="size-5" /></span>
              <span className="mt-4 block text-sm font-semibold">Your running order is blank</span>
              <span className="mt-1 block text-xs text-muted-foreground">Add the first link, or load the show template above.</span>
            </button>
          ) : (
            <div className="space-y-2">
              {workspace.items.map((item, index) => (
                (() => {
                  const readiness = getContextFirstReadiness(item, show.name)
                  return (
                <div
                  key={item.id}
                  data-studio-item-id={item.id}
                  draggable
                  onDragStart={(event) => {
                    setDragging(item.id)
                    event.dataTransfer.effectAllowed = "move"
                    event.dataTransfer.setData("text/plain", item.id)
                  }}
                  onDragEnd={() => setDragging("")}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropItem(item.id)}
                  onPointerEnter={() => moveDraggedItem(item.id)}
                  className={cn(
                    "flex w-full items-center rounded-2xl border bg-white text-left transition-all hover:-translate-y-0.5 hover:border-brand-indigo/25 hover:shadow-sm",
                    selected?.id === item.id && "border-brand-indigo/25 bg-brand-soft/35 ring-2 ring-brand-indigo/10",
                    draggingId === item.id && "opacity-45"
                  )}
                >
                  <button
                    type="button"
                    aria-label={`Drag ${item.title} to reorder`}
                    title="Drag to reorder"
                    onPointerDown={(event) => {
                      setDragging(item.id)
                      event.currentTarget.setPointerCapture(event.pointerId)
                      window.addEventListener("pointerup", () => setDragging(""), { once: true })
                    }}
                    onPointerMove={(event) => {
                      if (!draggingId) return
                      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-studio-item-id]")
                      if (target?.dataset.studioItemId) moveDraggedItem(target.dataset.studioItemId)
                    }}
                    className="grid touch-none self-stretch cursor-grab place-items-center px-2 text-muted-foreground hover:text-brand-indigo active:cursor-grabbing"
                  >
                    <GripVertical className="size-4" />
                  </button>
                  <button type="button" onClick={() => setSelectedId(item.id)} className="flex min-w-0 flex-1 items-center gap-3 py-3.5 pr-3.5 text-left">
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl font-mono text-[10px]", item.done ? "bg-success text-white" : "bg-muted text-muted-foreground")}>
                      {item.done ? <Check className="size-3.5" /> : String(index + 1).padStart(2, "0")}
                    </span>
                      <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-muted-foreground">{item.time || "No time"}</span><Badge variant="outline" className="text-[9px]">{item.type}</Badge>{item.hour && <Badge variant="outline" className="text-[9px]">{item.hour}</Badge>}{item.listenerLed && <Badge className="bg-violet-50 text-violet-700 text-[9px]">Gate</Badge>}{isLinerLink(item) && <Badge className="bg-fuchsia-50 text-fuchsia-700 text-[9px]">Liner</Badge>}</span>
                      <span className="mt-1 block truncate text-sm font-semibold">{item.title}</span>
                      <span className={cn("mt-1 inline-flex items-center gap-1 text-[10px] font-semibold", readiness.ready ? "text-success" : "text-amber-700")}>
                        {readiness.ready ? <Check className="size-3" /> : <CircleAlert className="size-3" />}
                        {readiness.ready ? "Framework ready" : `${readiness.score}/${readiness.total} complete`}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                </div>
                  )
                })()
              ))}
            </div>
          )}
        </section>

        <section>
          {selected ? (
            <Card className="rounded-[24px] py-0 shadow-card">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Edit current item</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em]">{selected.title}</h2>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" aria-label="Move item up" onClick={() => moveItem(selected.id, -1)}><ArrowUp /></Button>
                    <Button variant="outline" size="icon" aria-label="Move item down" onClick={() => moveItem(selected.id, 1)}><ArrowDown /></Button>
                    <Button variant="outline" size="icon" aria-label="Delete item" className="text-destructive" onClick={() => removeItem(selected.id)}><Trash2 /></Button>
                  </div>
                </div>

                {selectedReadiness && (
                  <div className={cn("rounded-[22px] border p-4", selectedReadiness.ready ? "border-success/20 bg-success-soft" : "border-amber-200 bg-amber-50")}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className={cn("text-[10px] font-semibold uppercase tracking-[0.15em]", selectedReadiness.ready ? "text-success" : "text-amber-800")}>BroadcastOS Link Framework check</p>
                        <p className="mt-1 text-sm font-semibold">Every listener joins mid-story. Context first, always.</p>
                      </div>
                      <Badge className={cn(selectedReadiness.ready ? "bg-success text-white" : "bg-amber-200 text-amber-950")}>
                        {selectedReadiness.ready ? "Ready" : `${selectedReadiness.score}/${selectedReadiness.total} complete`}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-5">
                      {selectedReadiness.checks.map((check) => (
                        <div key={check.label} title={check.hint} className={cn("rounded-2xl border px-3 py-2 text-xs font-semibold", check.ready ? "border-success/20 bg-white/70 text-success" : "border-amber-200 bg-white/70 text-amber-800")}>
                          <span className="inline-flex items-center gap-1.5">{check.ready ? <Check className="size-3" /> : <CircleAlert className="size-3" />}{check.label}</span>
                        </div>
                      ))}
                    </div>
                    {selectedReadiness.warnings.length > 0 && (
                      <div className="mt-3 rounded-2xl border border-amber-200 bg-white/70 p-3 text-xs leading-5 text-amber-900">
                        <p className="font-semibold">Warnings</p>
                        <ul className="mt-1 list-inside list-disc">
                          {selectedReadiness.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-[130px_1fr_150px]">
                  <Field label="Time"><Input type="time" value={selected.time} onChange={(event) => updateItem(selected.id, "time", event.target.value)} /></Field>
                  <Field label="Title"><Input value={selected.title} onChange={(event) => updateItem(selected.id, "title", event.target.value)} /></Field>
                  <Field label="Type">
                    <select className={fieldClass} value={selected.type} onChange={(event) => updateItem(selected.id, "type", event.target.value)}>
                      {["Link", "Feature", "Interaction", "Prayer", "Package", "Interview", "Song"].map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-[1fr_180px_150px]">
                  <Field label="Objective"><Input value={selected.objective} onChange={(event) => updateItem(selected.id, "objective", event.target.value)} placeholder="What must this link achieve?" /></Field>
                  <Field label="Feature ID"><Input value={selected.featureId} onChange={(event) => updateItem(selected.id, "featureId", event.target.value)} placeholder="Afternoon Uplift" /></Field>
                  <Field label="Target duration"><Input value={selected.duration} onChange={(event) => updateItem(selected.id, "duration", event.target.value)} placeholder="02:00" /></Field>
                </div>
                <label className="flex items-start gap-3 rounded-2xl border bg-brand-soft/25 p-4">
                  <input
                    type="checkbox"
                    checked={selected.listenerLed}
                    onChange={(event) => updateItem(selected.id, "listenerLed", event.target.checked)}
                    className="mt-1 size-4 accent-[var(--brand-indigo)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold">Listener-led / Response Gate</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      Turn this on when the link depends on messages. On Air will ask: “Do you have responses?” and show only the true version.
                    </span>
                  </span>
                </label>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Step 1 · Context" hint="Shown first in On Air">
                    <textarea rows={4} className={textareaClass} value={selected.context} onChange={(event) => updateItem(selected.id, "context", event.target.value)} placeholder="You’re listening to Afternoons with Adam on Premier Gospel…" />
                  </Field>
                  <Field label="Step 2 · Recap">
                    <textarea rows={4} className={textareaClass} value={selected.recap} onChange={(event) => updateItem(selected.id, "recap", event.target.value)} placeholder="If you’ve just joined us, we’re talking about…" />
                  </Field>
                </div>
                <Field label="Step 3 · The Moment" hint="One clear idea only">
                  <textarea rows={6} className={textareaClass} value={selected.script} onChange={(event) => updateItem(selected.id, "script", event.target.value)} placeholder="Story, listener message, clue, reveal, reflection, scripture, prayer, transition or station liner…" />
                </Field>
                {selected.listenerLed && (
                  <Field label="Response Gate · The Moment if no responses" hint="Replaces old fallback">
                    <textarea rows={6} className={textareaClass} value={selected.momentNoResponses} onChange={(event) => updateItem(selected.id, "momentNoResponses", event.target.value)} placeholder="A full speakable version that works honestly if no listener messages have arrived yet…" />
                  </Field>
                )}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Step 4 · Call To Action"><textarea rows={3} className={textareaClass} value={selected.cta} onChange={(event) => updateItem(selected.id, "cta", event.target.value)} placeholder="One primary listener action only." /></Field>
                  <Field label="Step 5 · Tease Ahead"><textarea rows={3} className={textareaClass} value={selected.tease} onChange={(event) => updateItem(selected.id, "tease", event.target.value)} placeholder="Why should the listener stay?" /></Field>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Station requirements"><textarea rows={3} className={textareaClass} value={selected.stationRequirement} onChange={(event) => updateItem(selected.id, "stationRequirement", event.target.value)} placeholder="Time check · Station ID · Presenter ID · liner placement…" /></Field>
                  <Field label="Producer notes"><textarea rows={3} className={textareaClass} value={selected.notes} onChange={(event) => updateItem(selected.id, "notes", event.target.value)} placeholder="Timing, audio, pronunciation or handover notes…" /></Field>
                </div>
                <Field label="What comes next"><textarea rows={2} className={textareaClass} value={selected.next} onChange={(event) => updateItem(selected.id, "next", event.target.value)} placeholder="The next song, feature, item or handover…" /></Field>
              </CardContent>
            </Card>
          ) : (
            <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-dashed bg-white p-8 text-center">
              <div><Clock3 className="mx-auto size-7 text-brand-indigo" /><p className="mt-3 font-semibold">Choose or add a running-order item</p><p className="mt-1 text-xs text-muted-foreground">The live script, CTA and notes will appear here.</p></div>
            </div>
          )}
        </section>
      </div>

      {workspace.mode === "remote" ? <section className="rounded-[26px] border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Manual listener inbox</p>
            <h2 className="mt-1 text-xl font-semibold">Paste WhatsApp or text messages</h2>
            <p className="mt-1 text-xs text-muted-foreground">Paste one message, multiple lines, or several WhatsApp blocks. Browser spellcheck is enabled; AI correction is not connected yet.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline"><ClipboardPaste />Manual paste only</Badge>
            <Badge className="bg-success-soft text-success">Spellcheck enabled</Badge>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <Field label="Messages">
            <textarea
              rows={6}
              spellCheck
              className={textareaClass}
              value={pasteValue}
              onChange={(event) => setPasteValue(event.target.value)}
              placeholder={"Michelle, Croydon — Please pray for my family.\nIt has been a hard week but today's conversation is helping.\n\nDavid: Can you play Promises by Maverick City please?\n\nSarah - Loving today’s question."}
            />
          </Field>
          <Button className="primary-action h-11 rounded-xl text-white" onClick={addMessages}><MessageSquareText />Add to On Air</Button>
        </div>
        {songRequests.length > 0 && (
          <div className="mt-5 rounded-[22px] border border-brand-indigo/10 bg-brand-soft/35 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-indigo">Song requests detected</p>
                <p className="mt-1 text-xs text-muted-foreground">Pulled from pasted listener messages. Check wording before reading on air.</p>
              </div>
              <Badge className="bg-white text-brand-indigo"><Music2 />{songRequests.length}</Badge>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {songRequests.map((song) => (
                <div key={song.id} className="rounded-2xl border bg-white p-3 text-xs">
                  <p className="font-semibold">{song.request}</p>
                  {song.sender && <p className="mt-1 text-muted-foreground">Requested by {song.sender}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {workspace.messages.length > 0 && (
          <div className="mt-5 grid gap-2 md:grid-cols-2">
            {workspace.messages.map((message) => (
              <label key={message.id} className="flex items-start gap-3 rounded-2xl border bg-muted/20 p-3.5">
                <input type="checkbox" checked={message.selected} onChange={() => saveStudioWorkspace({ ...workspace, messages: workspace.messages.map((item) => item.id === message.id ? { ...item, selected: !item.selected } : item) })} className="mt-1 accent-[var(--brand-indigo)]" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    {message.sender && <span className="rounded-full bg-brand-soft px-2 py-1 text-[10px] font-semibold text-brand-indigo">{message.sender}</span>}
                    {message.songRequests.length > 0 && <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-brand-indigo"><Music2 className="mr-1 inline size-3" />Song request</span>}
                  </span>
                  <span className="mt-2 block whitespace-pre-wrap text-xs leading-5">{message.body}</span>
                </span>
                <button type="button" aria-label="Delete listener message" onClick={() => saveStudioWorkspace({ ...workspace, messages: workspace.messages.filter((item) => item.id !== message.id) })} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
              </label>
            ))}
          </div>
        )}
      </section> : (
        <section className="rounded-[24px] border bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-indigo"><MessageSquareText className="size-4" /></span>
            <div><p className="text-sm font-semibold">Listener inbox hidden in studio mode</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Use the studio WhatsApp computer while you are in-house. Switch to Remote production when you need manual message paste.</p></div>
          </div>
        </section>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        <strong>Zetta is not connected.</strong> BroadcastOS will not claim to know the live song, song remaining time or playout position. Screenshot import stays disabled until genuine OCR/vision extraction and a confirmation screen are connected.
      </div>
    </div>
  )
}
