import type { StudioItem, StudioShowId } from "@/lib/studio-workspace"

type ParsedFields = Record<string, string>

export type ShowPlanImportResult = {
  items: StudioItem[]
  warnings: string[]
  showId?: StudioShowId
  metadata: ParsedFields
}

const fieldAliases: Record<string, string> = {
  "call to action": "cta",
  cta: "cta",
  feature: "feature",
  "fallback if messages are low": "fallback",
  "fallback if quiet": "fallback",
  fallback: "fallback",
  "fallback required": "fallbackRequired",
  "listener led": "listenerLed",
  "listener-led": "listenerLed",
  notes: "notes",
  objective: "objective",
  "main content": "script",
  moment: "script",
  "producer notes": "notes",
  recap: "recap",
  "station requirement": "stationRequirement",
  "station requirements": "stationRequirement",
  "target duration": "duration",
  tease: "tease",
  "tease ahead": "tease",
  "the moment": "script",
  title: "title",
  type: "type",
  "what comes next": "whatComesNext",
}

const fieldPattern = /^\s*([A-Za-z][A-Za-z0-9 /’'·–—-]+):\s*(.*)$/

const numberWords: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
}

function clean(value?: string) {
  return (value ?? "").trim()
}

function canonicalField(label: string) {
  const key = label
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return fieldAliases[key] ?? key.replace(/[^a-z0-9]+(.)/g, (_, character: string) => character.toUpperCase())
}

function parseFields(block: string): ParsedFields {
  const fields: ParsedFields = {}
  let currentKey = ""

  block.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trimEnd()
    if (!line.trim() || /^-{3,}$/.test(line.trim())) return

    const fieldLine = line
      .replace(/^\s*[-*]\s+/, "")
      .replace(/\*\*/g, "")
      .trimEnd()
    const match = fieldLine.match(fieldPattern)
    if (match) {
      currentKey = canonicalField(match[1])
      fields[currentKey] = clean(match[2])
      return
    }

    if (currentKey) {
      fields[currentKey] = [fields[currentKey], line.trim()].filter(Boolean).join("\n")
    }
  })

  return fields
}

function normalizeNumber(value: string) {
  const normalized = clean(value).toLowerCase()
  return numberWords[normalized] ?? normalized
}

function isYes(value?: string) {
  return /^(yes|true|required|y)\b/i.test(clean(value))
}

function isEffectivelyEmpty(value?: string) {
  const normalized = clean(value).toLowerCase()
  return !normalized || normalized === "not needed" || normalized === "n/a" || normalized === "none"
}

function inferShowId(showName?: string): StudioShowId | undefined {
  const normalized = clean(showName).toLowerCase()
  if (normalized.includes("afternoons")) return "afternoons"
  if (normalized.includes("sundays")) return "sundays"
  if (normalized.includes("saturday")) return "saturday"
  return undefined
}

function findSections(value: string, pattern: RegExp) {
  const matches = Array.from(value.matchAll(pattern))
  return matches.map((match, index) => {
    const start = match.index ?? 0
    const end = matches[index + 1]?.index ?? value.length
    return {
      header: match,
      body: value.slice(start + match[0].length, end),
      start,
      end,
    }
  })
}

function getHourName(hourFields: ParsedFields, hourNumber: string) {
  return clean(hourFields["hour name"]) || clean(hourFields.hourName) || `Hour ${hourNumber}`
}

export function parseShowPlanImport(value: string): ShowPlanImportResult {
  const normalized = value.replace(/\r\n/g, "\n").trim()
  const warnings: string[] = []
  const items: StudioItem[] = []

  if (!normalized) {
    return { items, warnings: ["Paste a show plan before importing."], metadata: {} }
  }

  const hourHeadingPattern = /^\s*(?:#{1,6}\s*)?HOUR\s+(\d+|one|two|three|four|five|six)\b.*$/gim
  const firstHourIndex = normalized.search(/^\s*(?:#{1,6}\s*)?HOUR\s+(?:\d+|one|two|three|four|five|six)\b/im)
  const metadata = parseFields(firstHourIndex >= 0 ? normalized.slice(0, firstHourIndex) : "")
  const showId = inferShowId(metadata.show)
  const hourSections = findSections(normalized, hourHeadingPattern)

  if (!hourSections.length) {
    return {
      items,
      warnings: ["No hour sections found. Use headings like # HOUR 1, ## HOUR 2 or HOUR THREE."],
      metadata,
      showId,
    }
  }

  hourSections.forEach((hourSection) => {
    const hourNumber = normalizeNumber(hourSection.header[1])
    const linkHeaderPattern = /^\s*(?:#{1,6}\s*)?LINK\s+(\d+|one|two|three|four|five|six)\b(?:\s*[:\-–—]\s*(.*))?$/gim
    const linkSections = findSections(hourSection.body, linkHeaderPattern)
    const firstLinkIndex = hourSection.body.search(/^\s*(?:#{1,6}\s*)?LINK\s+(?:\d+|one|two|three|four|five|six)\b/im)
    const hourFields = parseFields(firstLinkIndex >= 0 ? hourSection.body.slice(0, firstLinkIndex) : "")
    const hourName = getHourName(hourFields, hourNumber)
    const hourFeature = clean(hourFields.feature) || hourName

    if (!linkSections.length) {
      warnings.push(`Hour ${hourNumber} has no LINK sections.`)
      return
    }

    linkSections.forEach((linkSection, index) => {
      const linkNumber = normalizeNumber(linkSection.header[1])
      const headerTitle = clean(linkSection.header[2])
      const fields = parseFields(linkSection.body)
      const title = clean(fields.title) || headerTitle || `${hourName} · Link ${linkNumber}`
      const type = clean(fields.type) || "Link"
      const feature = clean(fields.feature) || hourFeature
      const fallback = clean(fields.fallback)
      const listenerLed = isYes(fields.listenerLed) || /interaction|listener/i.test(type)
      const fallbackRequired = isYes(fields.fallbackRequired) || listenerLed
      const whatComesNext = clean(fields.whatComesNext)
      const notes = [clean(fields.notes), whatComesNext ? `What comes next: ${whatComesNext}` : ""]
        .filter(Boolean)
        .join("\n\n")

      const item: StudioItem = {
        id: `import-${Date.now()}-${hourNumber}-${linkNumber}-${index}`,
        time: "",
        title,
        type,
        hour: `Hour ${hourNumber} · ${hourName}`,
        featureId: feature,
        objective: clean(fields.objective) || `${feature}: ${title}`,
        duration: clean(fields.duration) || "",
        context: clean(fields.context),
        recap: clean(fields.recap),
        script: clean(fields.script),
        cta: clean(fields.cta),
        tease: clean(fields.tease),
        fallback,
        stationRequirement: clean(fields.stationRequirement),
        notes,
        done: false,
      }

      ;(["context", "recap", "script", "cta", "tease"] as const).forEach((key) => {
        if (!item[key]) warnings.push(`${item.title}: ${key === "script" ? "The Moment" : key} is missing.`)
      })

      if (fallbackRequired && isEffectivelyEmpty(fallback)) {
        warnings.push(`${item.title}: listener-led links need a prepared fallback if messages are quiet.`)
      }

      items.push(item)
    })
  })

  return { items, warnings, metadata, showId }
}
