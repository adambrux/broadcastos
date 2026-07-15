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

export type LinerExtractionOptions = {
  showName?: string
  usedInShow?: boolean
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
  { value: "file", label: "Text file", helper: "TXT, Markdown and CSV work today. For Word or PDF, paste the useful text instead." },
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

export function weekStartFromDate(value: string | Date = new Date()) {
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

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function sentenceTitle(value: string) {
  const clean = value
    .replace(/^(liner|promo|read|campaign|station liner|station requirement|station requirements|the moment)\s*[:\-–]\s*/i, "")
    .replace(/^[-*]\s+/, "")
    .trim()
  const firstUsefulLine = clean
    .split(/\n/)
    .map((line) => line.replace(/^(title|feature|script|station requirement|station requirements)\s*:\s*/i, "").trim())
    .find((line) => line && /(liner|promo|read|campaign|youtube|e-?book|ebook|appeal|marketplace|premier plus|guess the judas|truth for life)/i.test(line))
    ?? clean

  return firstUsefulLine.split(/[.!?]/)[0]?.slice(0, 74).trim() || "Untitled liner"
}

function candidateBlocks(content: string) {
  const normalized = content.replace(/\r\n/g, "\n")
  const largeBlocks = normalized
    .split(/\n\s*\n|(?=^\s*(?:#{1,6}\s*)?LINK\s+\d+\b)|(?=^\s*(?:#{1,6}\s*)?(?:liner|promo|read|campaign|station liner)\s*:)/gim)
    .map((block) => block.trim())
    .filter(Boolean)

  const usefulLines = normalized
    .split("\n")
    .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
    .filter((line) => line.length > 8)

  return uniqueValues([...largeBlocks, ...usefulLines])
}

export function extractLikelyLiners(
  content: string,
  weekStart: string,
  sourceImportId: string,
  options: LinerExtractionOptions = {}
): LinerArchiveItem[] {
  const linerWords = /(liner|promo|promotional|read|campaign|youtube|e-?book|ebook|appeal|marketplace|premier plus|guess the judas|truth for life)/i
  const ignoredWords = /(time check|station id|presenter id|tease ahead|whatsapp|text number|fader|dead air|keyboard clicks|audio level)/i
  const candidates = candidateBlocks(content)
    .filter((block) => linerWords.test(block))
    .filter((block) => !ignoredWords.test(block) || /(guess the judas|truth for life|marketplace|appeal|premier plus|youtube|e-?book|ebook)/i.test(block))
    .slice(0, 12)
  const usageDate = new Date().toISOString().slice(0, 10)
  const showName = options.showName?.trim()

  return candidates.map((block, index) => ({
    id: `liner-${sourceImportId}-${index + 1}`,
    title: sentenceTitle(block),
    script: block,
    weekStart,
    sourceImportId,
    showsUsed: options.usedInShow && showName ? [showName] : [],
    usageCount: options.usedInShow ? 1 : 0,
    firstUsed: options.usedInShow ? usageDate : undefined,
    lastUsed: options.usedInShow ? usageDate : undefined,
    status: "Active",
    createdAt: new Date().toISOString(),
  }))
}

export function createLinerFromText(
  content: string,
  weekStart: string,
  sourceImportId: string,
  options: LinerExtractionOptions = {}
): LinerArchiveItem {
  const usageDate = new Date().toISOString().slice(0, 10)
  const showName = options.showName?.trim()

  return {
    id: `liner-${sourceImportId}-manual`,
    title: sentenceTitle(content),
    script: content.trim(),
    weekStart,
    sourceImportId,
    showsUsed: options.usedInShow && showName ? [showName] : [],
    usageCount: options.usedInShow ? 1 : 0,
    firstUsed: options.usedInShow ? usageDate : undefined,
    lastUsed: options.usedInShow ? usageDate : undefined,
    status: "Active",
    createdAt: new Date().toISOString(),
  }
}

function readStringField(value: unknown, key: string) {
  if (!value || typeof value !== "object") return ""
  const field = (value as Record<string, unknown>)[key]
  return typeof field === "string" ? field : ""
}

export function serialiseShowPlanForPresenterHub(workspace: {
  date?: string
  items?: unknown[]
}) {
  const items = Array.isArray(workspace.items) ? workspace.items : []

  return [
    workspace.date ? `Date: ${workspace.date}` : "",
    ...items.map((item, index) => [
      `LINK ${index + 1}`,
      readStringField(item, "hour") ? `Hour: ${readStringField(item, "hour")}` : "",
      readStringField(item, "time") ? `Time: ${readStringField(item, "time")}` : "",
      readStringField(item, "title") ? `Title: ${readStringField(item, "title")}` : "",
      readStringField(item, "type") ? `Type: ${readStringField(item, "type")}` : "",
      readStringField(item, "featureId") ? `Feature: ${readStringField(item, "featureId")}` : "",
      typeof (item as Record<string, unknown>)?.listenerLed === "boolean" ? `Listener-led: ${(item as Record<string, unknown>).listenerLed ? "Yes" : "No"}` : "",
      readStringField(item, "objective") ? `Objective: ${readStringField(item, "objective")}` : "",
      readStringField(item, "duration") ? `Target Duration: ${readStringField(item, "duration")}` : "",
      readStringField(item, "context") ? `Context: ${readStringField(item, "context")}` : "",
      readStringField(item, "recap") ? `Recap: ${readStringField(item, "recap")}` : "",
      readStringField(item, "momentNoResponses")
        ? `The Moment · If Responses: ${readStringField(item, "script")}`
        : readStringField(item, "script") ? `The Moment: ${readStringField(item, "script")}` : "",
      readStringField(item, "momentNoResponses") ? `The Moment · If No Responses: ${readStringField(item, "momentNoResponses")}` : "",
      readStringField(item, "cta") ? `Call To Action: ${readStringField(item, "cta")}` : "",
      readStringField(item, "tease") ? `Tease Ahead: ${readStringField(item, "tease")}` : "",
      readStringField(item, "stationRequirement") ? `Station Requirement: ${readStringField(item, "stationRequirement")}` : "",
      readStringField(item, "next") ? `What Comes Next: ${readStringField(item, "next")}` : "",
      readStringField(item, "notes") ? `Producer Notes: ${readStringField(item, "notes")}` : "",
    ].filter(Boolean).join("\n")),
  ].filter(Boolean).join("\n\n")
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
