"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Archive,
  CalendarDays,
  Check,
  FileText,
  FolderOpen,
  History,
  Loader2,
  Megaphone,
  Radio,
  Search,
  Upload,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  formatWeekLabel,
  friendlyImportTitle,
  presenterHubKinds,
  presenterHubShows,
  weekStartFromDate,
  type LinerArchiveItem,
  type PresenterHubImport,
  type PresenterHubImportKind,
} from "@/lib/presenter-hub"
import { cn } from "@/lib/utils"

type PresenterHubResponse = {
  imports: PresenterHubImport[]
  liners: LinerArchiveItem[]
  storageMode: string
}

const sourceStyles: Record<string, string> = {
  "Weekly brief": "bg-brand-soft text-brand-indigo",
  "Manual paste": "bg-muted text-muted-foreground",
  "Show script": "bg-emerald-50 text-emerald-700",
  "Station supplied": "bg-fuchsia-50 text-fuchsia-700",
  "Uploaded file": "bg-amber-50 text-amber-700",
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function importKindLabel(kind: PresenterHubImportKind) {
  return presenterHubKinds.find((item) => item.value === kind)?.label ?? "Import"
}

async function readFileForImport(file: File) {
  return file.text()
}

export function NewsroomPage() {
  const [imports, setImports] = useState<PresenterHubImport[]>([])
  const [liners, setLiners] = useState<LinerArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState("")
  const [query, setQuery] = useState("")
  const [kind, setKind] = useState<PresenterHubImportKind>("weekly-brief")
  const [showName, setShowName] = useState("Premier Gospel")
  const [weekStart, setWeekStart] = useState(weekStartFromDate())
  const [content, setContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  async function loadHub() {
    setLoading(true)
    try {
      const response = await fetch("/api/presenter-hub", { cache: "no-store" })
      const data = await response.json() as PresenterHubResponse
      setImports(data.imports ?? [])
      setLiners(data.liners ?? [])
    } catch {
      setNotice("Presenter Hub could not load yet. Try refreshing in a moment.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadHub()
  }, [])

  const visibleLiners = useMemo(() => {
    const needle = query.toLowerCase()
    return liners.filter((liner) => `${liner.title} ${liner.script} ${liner.weekStart} ${liner.showsUsed.join(" ")}`.toLowerCase().includes(needle))
  }, [liners, query])

  const visibleImports = useMemo(() => {
    const needle = query.toLowerCase()
    return imports.filter((item) => `${item.title} ${item.showName} ${item.originalFilename ?? ""} ${item.content}`.toLowerCase().includes(needle))
  }, [imports, query])

  const activeLiners = liners.filter((liner) => liner.status === "Active").length
  const weeklyLiners = liners.filter((liner) => liner.weekStart === weekStart).length
  const totalUsage = liners.reduce((sum, liner) => sum + liner.usageCount, 0)
  const latestImport = imports[0]
  const canSave = Boolean(content.trim() || selectedFile)

  async function saveImport() {
    if (!canSave) return
    setSaving(true)
    setNotice("")

    try {
      const fileContent = selectedFile ? await readFileForImport(selectedFile) : ""
      const importContent = content.trim() || fileContent
      const effectiveKind = kind
      const response = await fetch("/api/presenter-hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: effectiveKind,
          showName,
          weekStart,
          originalFilename: selectedFile?.name,
          content: importContent,
          title: friendlyImportTitle(effectiveKind, showName, weekStart, selectedFile?.name),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(data?.error ?? "Import failed")
      }

      const data = await response.json() as { extractedLiners?: LinerArchiveItem[] }
      setNotice(data.extractedLiners?.length
        ? `Saved and pulled out ${data.extractedLiners.length} likely liner${data.extractedLiners.length === 1 ? "" : "s"}.`
        : "Saved to Presenter Hub.")
      setContent("")
      setSelectedFile(null)
      await loadHub()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save this import.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[32px] bg-[#10111a] text-white shadow-card">
        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <div className="absolute -right-24 -top-28 size-80 rounded-full bg-brand-magenta/15 blur-3xl" />
          <div className="absolute bottom-0 left-20 h-32 w-80 rounded-full bg-brand-indigo/20 blur-3xl" />
          <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)] xl:items-end">
            <div>
              <Badge className="border-white/10 bg-white/10 text-white"><Radio />Presenter Hub</Badge>
              <h1 className="mt-5 text-[42px] font-semibold tracking-[-0.055em] sm:text-[58px]">Presenter Hub</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
                Weekly briefs and station liners in one place. Every time a show script is imported, liner reads are counted automatically.
              </p>
            </div>
          </div>
        </div>
        <div className="grid border-t border-white/10 bg-white/[0.035] sm:grid-cols-4">
          <Metric label="Stored liners" value={String(liners.length)} note={`${activeLiners} active`} dark />
          <Metric label="This week" value={String(weeklyLiners)} note={formatWeekLabel(weekStart)} dark />
          <Metric label="Recorded uses" value={String(totalUsage)} note="From imported scripts" dark />
          <Metric label="Latest import" value={latestImport ? formatDate(latestImport.createdAt) : "—"} note={latestImport?.title ?? "Nothing saved yet"} dark />
        </div>
      </header>

      {notice && (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-brand-indigo/15 bg-brand-soft px-4 py-3 text-sm text-brand-indigo">
          <Check className="size-4" />
          <span className="flex-1">{notice}</span>
          <button type="button" className="font-semibold" onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <Card className="rounded-[30px] shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Simple import</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Paste first, save once</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Paste the useful text. BroadcastOS creates the friendly title automatically and stores it centrally.</p>
              </div>
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand-indigo"><Upload className="size-5" /></span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Content type</span>
                <select value={kind} onChange={(event) => setKind(event.target.value as PresenterHubImportKind)} className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                  {presenterHubKinds.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Week</span>
                <Input type="date" value={weekStart} onChange={(event) => setWeekStart(event.target.value)} className="h-11 rounded-xl" />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-semibold text-muted-foreground">Show / station</span>
                <select value={showName} onChange={(event) => setShowName(event.target.value)} className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                  <option>Premier Gospel</option>
                  {presenterHubShows.map((show) => <option key={show}>{show}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-2xl border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
              {presenterHubKinds.find((item) => item.value === kind)?.helper}
            </div>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              spellCheck
              placeholder="Paste the weekly brief, station liner, or show script here…"
              className="mt-4 min-h-[210px] w-full resize-y rounded-2xl border bg-white p-4 text-sm leading-6 outline-none placeholder:text-muted-foreground/45 focus:ring-2 focus:ring-ring"
            />

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-brand-soft/20 px-4 py-6 text-center transition hover:border-brand-indigo/30">
              <FolderOpen className="size-6 text-brand-indigo" />
              <span className="mt-2 text-sm font-semibold">{selectedFile ? selectedFile.name : "Optional: choose a plain text file"}</span>
              <span className="mt-1 text-xs text-muted-foreground">TXT, Markdown and CSV files work. For Word or PDF, paste the text above instead.</span>
              <input
                type="file"
                className="sr-only"
                accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <Button className="primary-action mt-5 h-12 w-full rounded-2xl text-white" disabled={!canSave || saving} onClick={saveImport}>
              {saving ? <Loader2 className="animate-spin" /> : <Archive />}
              Save to Presenter Hub
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-brand-indigo/10 bg-gradient-to-br from-white to-brand-soft/25 shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Liner archive</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">What was used, when</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Normally two station liners a week. This keeps the week, show and usage count together.</p>
              </div>
              <label className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search liners or files" className="h-11 rounded-xl pl-9" />
              </label>
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed text-sm text-muted-foreground"><Loader2 className="mb-2 size-5 animate-spin" />Loading Presenter Hub…</div>
              ) : visibleLiners.length ? (
                visibleLiners.map((liner) => <LinerCard key={liner.id} liner={liner} />)
              ) : (
                <div className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">
                  <Megaphone className="mx-auto mb-3 size-6" />
                  No liners match this search yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="rounded-[28px] shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-indigo">Imported files and pastes</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Everything you’ve saved</h2>
              </div>
              <Badge className="bg-muted text-muted-foreground">{visibleImports.length} records</Badge>
            </div>

            <div className="mt-5 divide-y">
              {visibleImports.map((item) => (
                <div key={item.id} className="grid gap-3 py-4 md:grid-cols-[1fr_.7fr_.6fr] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={sourceStyles[item.sourceLabel] ?? "bg-muted text-muted-foreground"}>{item.sourceLabel}</Badge>
                      <span className="text-xs text-muted-foreground">{importKindLabel(item.kind)}</span>
                    </div>
                    <p className="mt-2 truncate font-semibold">{item.title}</p>
                    {item.originalFilename && <p className="mt-1 truncate text-xs text-muted-foreground">Original file: {item.originalFilename}</p>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{item.showName}</p>
                    <p>{formatWeekLabel(item.weekStart)}</p>
                  </div>
                  <div className="text-xs text-muted-foreground md:text-right">
                    <p>{formatDate(item.createdAt)}</p>
                    <p>{item.content.length.toLocaleString()} characters</p>
                  </div>
                </div>
              ))}
              {!visibleImports.length && (
                <div className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">
                  <FileText className="mx-auto mb-3 size-6" />
                  No saved imports yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] bg-ink text-white shadow-card">
          <CardContent className="p-5 sm:p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-brand-magenta"><History className="size-5" /></span>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">Liners look after themselves</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-white/65">
              <Step number="1" title="Save the weekly brief" body="The liners inside it are pulled out and stored for the week." />
              <Step number="2" title="Import your show as normal" body="Every script import counts which liners were read, with no extra steps." />
              <Step number="3" title="Look back any time" body="Search by liner, week or show. Read counts also appear in Insights." />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function Metric({ label, value, note, dark = false }: { label: string; value: string; note: string; dark?: boolean }) {
  return (
    <div className={cn("px-6 py-4 sm:px-8", dark && "border-white/10 sm:border-l first:sm:border-l-0")}>
      <p className={cn("text-[10px] uppercase tracking-[0.14em]", dark ? "text-white/40" : "text-muted-foreground")}>{label}</p>
      <p className={cn("mt-1 font-mono text-2xl font-semibold", dark && "text-white")}>{value}</p>
      <p className={cn("truncate text-[10px]", dark ? "text-white/40" : "text-muted-foreground")}>{note}</p>
    </div>
  )
}

function LinerCard({ liner }: { liner: LinerArchiveItem }) {
  return (
    <article className="rounded-[24px] border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={liner.status === "Active" ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}>{liner.status}</Badge>
            <Badge variant="outline"><CalendarDays />{formatWeekLabel(liner.weekStart)}</Badge>
            <Badge className="bg-brand-soft text-brand-indigo">{liner.usageCount} use{liner.usageCount === 1 ? "" : "s"}</Badge>
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.035em]">{liner.title}</h3>
          <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-muted/25 p-4 text-sm leading-6 text-muted-foreground">{liner.script}</p>
        </div>
        <div className="min-w-52 rounded-2xl border bg-brand-soft/25 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-indigo">Included in</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {liner.showsUsed.length ? liner.showsUsed.map((show) => <span key={show} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-indigo">{show}</span>) : <span className="text-xs text-muted-foreground">Not found in an imported script yet</span>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div><p className="font-semibold text-foreground">First used</p><p>{liner.firstUsed ? formatDate(liner.firstUsed) : "—"}</p></div>
            <div><p className="font-semibold text-foreground">Last used</p><p>{liner.lastUsed ? formatDate(liner.lastUsed) : "—"}</p></div>
          </div>
        </div>
      </div>
    </article>
  )
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-sm font-semibold text-ink">{number}</span>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-white/55">{body}</p>
      </div>
    </div>
  )
}
