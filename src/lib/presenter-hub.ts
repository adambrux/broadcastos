export type PresenterHubSource = "Weekly brief" | "Manual paste" | "Show script" | "Station supplied" | "Uploaded file"
export type PresenterHubImportKind = "weekly-brief" | "show-script" | "liner" | "listener-messages" | "station-notes" | "file"
export type LinerStatus = "Active" | "Expired" | "Archived"

export type PresenterHubImport = {
  id: string
  title: string
  kind: PresenterHubImportKind
  sourceLabel: PresenterHubSource
  weekStart: string
  showName: string
  originalFilename?: string
  content: string
  createdAt: string
}

export type LinerArchiveItem = {
  id: string
  title: string
  script: string
  weekStart: string
  sourceImportId?: string
  showsUsed: string[]
  usageCount: number
  firstUsed?: string
  lastUsed?: string
  status: LinerStatus
  createdAt: string
}

export const presenterHubShows = [
  "Afternoons with Adam",
  "Sundays with Adam",
  "Saturday Breakfast",
  "Daytimes with Ibe Giantkiller",
] as const

export const presenterHubKinds: { value: PresenterHubImportKind; label: string; helper: string }[] = [
  { value: "weekly-brief", label: "Weekly brief", helper: "Best for station liners, campaigns and reminders." },
  { value: "show-script", label: "Show script", helper: "Counts how often stored liners appeared in the show plan." },
  { value: "liner", label: "Single liner", helper: "Paste one station liner directly into the archive." },
  { value: "listener-messages", label: "Listener messages", helper: "Store message batches for recall." },
  { value: "station-notes", label: "Station notes", helper: "General production notes from Premier Gospel." },
  { value: "file", label: "Uploaded file", helper: "File stored as a friendly record. PDF/Word text extraction comes later." },
]

export const mockPresenterImports: PresenterHubImport[] = [
  {
    id: "brief-2026-07-13",
    title: "Weekly Brief · Week of 13 July 2026",
    kind: "weekly-brief",
    sourceLabel: "Weekly brief",
    weekStart: "2026-07-13",
    showName: "Premier Gospel",
    originalFilename: "Premier Gospel weekly briefing 13 July 2026.docx",
    content: "Guess The Judas YouTube liner. Truth for Life free July e-book liner. Remember time, station and name checks twice per hour.",
    createdAt: "2026-07-13T09:00:00.000Z",
  },
  {
    id: "script-afternoons-2026-07-14",
    title: "Show Script · Afternoons with Adam · 14 July 2026",
    kind: "show-script",
    sourceLabel: "Show script",
    weekStart: "2026-07-13",
    showName: "Afternoons with Adam",
    content: "Include Guess The Judas YouTube liner in hour two. Truth for Life free July e-book liner in hour three.",
    createdAt: "2026-07-14T10:30:00.000Z",
  },
]

export const mockLiners: LinerArchiveItem[] = [
  {
    id: "liner-judas-2026-07-13",
    title: "Guess The Judas YouTube liner",
    script: "Guess The Judas is on Premier Gospel YouTube this week. Watch, share and join the conversation.",
    weekStart: "2026-07-13",
    sourceImportId: "brief-2026-07-13",
    showsUsed: ["Afternoons with Adam"],
    usageCount: 1,
    firstUsed: "2026-07-14",
    lastUsed: "2026-07-14",
    status: "Active",
    createdAt: "2026-07-13T09:00:00.000Z",
  },
  {
    id: "liner-truth-2026-07-13",
    title: "Truth for Life free July e-book",
    script: "Truth for Life has a free e-book available this July through Premier Gospel. Find out more through Premier.",
    weekStart: "2026-07-13",
    sourceImportId: "brief-2026-07-13",
    showsUsed: ["Afternoons with Adam"],
    usageCount: 1,
    firstUsed: "2026-07-14",
    lastUsed: "2026-07-14",
    status: "Active",
    createdAt: "2026-07-13T09:00:00.000Z",
  },
]

export function weekStartFromDate(value = new Date()) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : new Date(value)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date.toISOString().slice(0, 10)
}

export function formatWeekLabel(weekStart: string) {
  const date = new Date(`${weekStart}T12:00:00`)
  if (Number.isNaN(date.getTime())) return "Week not set"
  return `Week of ${date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
}

export function friendlyImportTitle(kind: PresenterHubImportKind, showName: string, weekStart: string, originalFilename?: string) {
  const week = formatWeekLabel(weekStart)
  if (kind === "weekly-brief") return `Weekly Brief · ${week}`
  if (kind === "show-script") return `Show Script · ${showName} · ${week}`
  if (kind === "liner") return `Station Liner · ${week}`
  if (kind === "listener-messages") return `Listener Messages · ${showName} · ${week}`
  if (kind === "station-notes") return `Station Notes · ${week}`
  return originalFilename ? `Uploaded File · ${week}` : `Imported File · ${week}`
}

function normalise(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim()
}

function sentenceTitle(value: string) {
  const clean = value.replace(/^(liner|promo|read|campaign|station liner)\s*[:\-–]\s*/i, "").trim()
  return clean.split(/[.!?]/)[0]?.slice(0, 74).trim() || "Untitled liner"
}

export function extractLikelyLiners(content: string, weekStart: string, sourceImportId: string): LinerArchiveItem[] {
  const blocks = content
    .split(/\n\s*\n|(?=^liner\s*:)|(?=^promo\s*:)|(?=^read\s*:)/gim)
    .map((block) => block.trim())
    .filter(Boolean)

  const linerWords = /(liner|promo|promotional|read|campaign|youtube|e-?book|ebook|appeal|marketplace|premier plus|guess the judas|truth for life)/i
  const candidates = blocks.filter((block) => linerWords.test(block)).slice(0, 8)

  return candidates.map((block, index) => ({
    id: `liner-${sourceImportId}-${index + 1}`,
    title: sentenceTitle(block),
    script: block,
    weekStart,
    sourceImportId,
    showsUsed: [],
    usageCount: 0,
    status: "Active",
    createdAt: new Date().toISOString(),
  }))
}

export function createLinerFromText(content: string, weekStart: string, sourceImportId: string): LinerArchiveItem {
  return {
    id: `liner-${sourceImportId}-manual`,
    title: sentenceTitle(content),
    script: content.trim(),
    weekStart,
    sourceImportId,
    showsUsed: [],
    usageCount: 0,
    status: "Active",
    createdAt: new Date().toISOString(),
  }
}

export function countLinerMatches(content: string, liner: Pick<LinerArchiveItem, "title" | "script">) {
  const searchable = normalise(content)
  const title = normalise(liner.title)
  const script = normalise(liner.script)
  const scriptLead = script.split(" ").slice(0, 8).join(" ")
  const patterns = [title, scriptLead].filter((pattern) => pattern.length > 12)

  return patterns.reduce((count, pattern) => {
    const matches = searchable.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))
    return Math.max(count, matches?.length ?? 0)
  }, 0)
}

export function applyLinerUsage(liners: LinerArchiveItem[], imports: PresenterHubImport[]) {
  const showScripts = imports.filter((item) => item.kind === "show-script")

  return liners.map((liner) => {
    const matchingScripts = showScripts.filter((item) => item.weekStart === liner.weekStart)
    const usage = matchingScripts.map((item) => ({
      show: item.showName,
      count: countLinerMatches(item.content, liner),
      date: item.createdAt.slice(0, 10),
    })).filter((item) => item.count > 0)

    const showsUsed = Array.from(new Set([...liner.showsUsed, ...usage.map((item) => item.show)]))
    const usageCount = Math.max(liner.usageCount, usage.reduce((sum, item) => sum + item.count, 0))
    const dates = usage.map((item) => item.date).sort()

    return {
      ...liner,
      showsUsed,
      usageCount,
      firstUsed: dates[0] ?? liner.firstUsed,
      lastUsed: dates.at(-1) ?? liner.lastUsed,
    }
  })
}
