import type { PreShowPromo, StudioItem, StudioShowId } from "@/lib/studio-workspace"

type ParsedFields = Record<string, string>

export type ShowPlanImportResult = {
  items: StudioItem[]
  warnings: string[]
  showId?: StudioShowId
  metadata: ParsedFields
  preShowPromo: PreShowPromo
}

const fieldAliases: Record<string, string> = {
  "call to action": "cta",
  cta: "cta",
  feature: "feature",
  "if no responses": "momentNoResponses",
  "response gate": "responseGate",
  "if responses": "script",
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
  "moment if no responses": "momentNoResponses",
  "moment if responses": "script",
  "producer notes": "notes",
  recap: "recap",
  "station requirement": "stationRequirement",
  "station requirements": "stationRequirement",
  "target duration": "duration",
  "30 second video script": "videoScript",
  "30-second video script": "videoScript",
  "video script": "videoScript",
  "story script": "videoScript",
  "whatsapp": "whatsappStatus",
  "whatsapp status": "whatsappStatus",
  "whatsapp status message": "whatsappStatus",
  tease: "tease",
  "tease ahead": "tease",
  "the moment": "script",
  "the moment if no responses": "momentNoResponses",
  "the moment if responses": "script",
  "the moment · if no responses": "momentNoResponses",
  "the moment · if responses": "script",
  "the moment - if no responses": "momentNoResponses",
  "the moment - if responses": "script",
  "the moment – if no responses": "momentNoResponses",
  "the moment – if responses": "script",
  title: "title",
  type: "type",
  "what comes next": "whatComesNext",
}

const fieldPattern = /^\s*([A-Za-z0-9][A-Za-z0-9 /’'·–—-]+):\s*(.*)$/

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

function emptyPreShowPromo(): PreShowPromo {
  return { whatsappStatus: "", videoScript: "" }
}

function parsePreShowPromo(normalized: string): PreShowPromo {
  const promoHeading = normalized.match(/^\s*(?:#{1,6}\s*)?PRE[-\s]?SHOW\s+PROMO\b.*$/im)
  if (!promoHeading || promoHeading.index === undefined) return emptyPreShowPromo()

  const body = normalized.slice(promoHeading.index + promoHeading[0].length)
  const fields = parseFields(body)

  const fromFields = {
    whatsappStatus: clean(fields.whatsappStatus),
    videoScript: clean(fields.videoScript),
  }
  if (fromFields.whatsappStatus || fromFields.videoScript) return fromFields

  // Docx exports use headings ("STATUS MESSAGE (written post)" / "VIDEO SCRIPT (…)")
  // followed by paragraphs, not "label: value" lines. Read those too.
  return {
    whatsappStatus: extractHeadingSection(body, /^\s*(?:#{1,6}\s*)?STATUS\s+MESSAGE\b.*$/im, /^\s*(?:#{1,6}\s*)?VIDEO\s+SCRIPT\b/im),
    videoScript: extractHeadingSection(body, /^\s*(?:#{1,6}\s*)?VIDEO\s+SCRIPT\b.*$/im, /^\s*(?:#{1,6}\s*)?[A-Z][A-Z ·]+$/m),
  }
}

function extractHeadingSection(body: string, headingPattern: RegExp, stopPattern: RegExp): string {
  const heading = body.match(headingPattern)
  if (!heading || heading.index === undefined) return ""
  let section = body.slice(heading.index + heading[0].length)
  const stop = section.match(stopPattern)
  if (stop && stop.index !== undefined) section = section.slice(0, stop.index)
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^Post both/i.test(line) && !/^Producer note/i.test(line))
    .join(" ")
    .trim()
}

function warnIfDirectionsLeak(item: StudioItem, warnings: string[]) {
  const speakableFields = [
    ["Context", item.context],
    ["Recap", item.recap],
    ["The Moment", item.script],
    ["The Moment · If No Responses", item.momentNoResponses],
    ["Call To Action", item.cta],
    ["Tease Ahead", item.tease],
  ] as const

  speakableFields.forEach(([label, value]) => {
    if (/\b(producer note|direction|bed|sfx|jingle|pause for|do not|remember to)\b/i.test(value)) {
      warnings.push(`${item.title}: ${label} may contain production directions. Script fields should contain speakable words only.`)
    }
  })
}

export function parseShowPlanImport(value: string): ShowPlanImportResult {
  const normalized = value.replace(/\r\n/g, "\n").trim()
  const warnings: string[] = []
  const items: StudioItem[] = []

  if (!normalized) {
    return { items, warnings: ["Paste a show plan before importing."], metadata: {}, preShowPromo: emptyPreShowPromo() }
  }

  const hourHeadingPattern = /^\s*(?:#{1,6}\s*)?HOUR\s+(\d+|one|two|three|four|five|six)\b.*$/gim
  const firstHourIndex = normalized.search(/^\s*(?:#{1,6}\s*)?HOUR\s+(?:\d+|one|two|three|four|five|six)\b/im)
  const metadata = parseFields(firstHourIndex >= 0 ? normalized.slice(0, firstHourIndex) : "")
  const showId = inferShowId(metadata.show)
  const hourSections = findSections(normalized, hourHeadingPattern)
  const hasPreShowPromo = /^\s*(?:#{1,6}\s*)?PRE[-\s]?SHOW\s+PROMO\b/im.test(normalized)
  const preShowPromo = parsePreShowPromo(normalized)

  if (!hourSections.length) {
    return {
      items,
      warnings: ["No hour sections found. Use headings like # HOUR 1, ## HOUR 2 or HOUR THREE."],
      metadata,
      showId,
      preShowPromo,
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

    if (linkSections.length !== 6) {
      warnings.push(`Hour ${hourNumber} should contain exactly six links. BroadcastOS found ${linkSections.length}.`)
    }

    linkSections.forEach((linkSection, index) => {
      const linkNumber = normalizeNumber(linkSection.header[1])
      const headerTitle = clean(linkSection.header[2])
      const fields = parseFields(linkSection.body)
      const title = clean(fields.title) || headerTitle || `${hourName} · Link ${linkNumber}`
      const type = clean(fields.type) || "Link"
      const feature = clean(fields.feature) || hourFeature
      const listenerLed = isYes(fields.listenerLed) || /interaction|listener/i.test(type)
      // Never promote legacy fallback text into the gate: a variant is explicit or absent.
      const momentNoResponses = isEffectivelyEmpty(fields.momentNoResponses) ? "" : clean(fields.momentNoResponses)
      const responseGate = isYes(fields.responseGate) || Boolean(momentNoResponses)
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
        momentNoResponses,
        cta: clean(fields.cta),
        tease: clean(fields.tease),
        listenerLed,
        responseGate,
        next: whatComesNext,
        fallback: "",
        stationRequirement: clean(fields.stationRequirement),
        notes,
        done: false,
      }

      ;(["context", "recap", "script", "cta", "tease"] as const).forEach((key) => {
        if (!item[key]) warnings.push(`${item.title}: ${key === "script" ? "The Moment" : key} is missing.`)
      })

      if (responseGate && isEffectivelyEmpty(momentNoResponses)) {
        warnings.push(`${item.title}: Response Gate links need The Moment · If No Responses.`)
      }

      const readsMessages = /\[(?:read|play|include)\b/i.test(item.script) || /\bread the (?:best|messages|responses)\b/i.test(item.script)
      if (readsMessages && !responseGate) {
        warnings.push(`${item.title}: this Moment reads listener messages but has NO "If No Responses" version. This looks like an old-format document… re-import the latest Format v2 show plan, or add the second Moment in Producer Desk.`)
      }

      if (
        responseGate &&
        !clean(fields.script).match(/\b(message|messages|response|responses|reply|replies|whatsapp|text|voice note)\b/i) &&
        !/\[(?:read|play|include)\b/i.test(clean(fields.script))
      ) {
        warnings.push(`${item.title}: Response Gate is on, but The Moment · If Responses does not obviously reference listener responses.`)
      }

      if (isLinerLink(item) && !/\[LINER STARTS HERE/i.test(item.script)) {
        warnings.push(`${item.title}: liner links should include [LINER STARTS HERE · …] inside The Moment.`)
      }

      if (/track of the week/i.test(`${item.title} ${item.featureId}`) && !/3|three|15|final/i.test(item.hour)) {
        warnings.push(`${item.title}: Track of the Week is usually expected in the 3 o’clock/final hour.`)
      }

      warnIfDirectionsLeak(item, warnings)

      items.push(item)
    })
  })

  if (!hasPreShowPromo) {
    warnings.push("No PRE-SHOW PROMO section found. Script Format v2 expects one at the end of every plan.")
  } else {
    if (!preShowPromo.whatsappStatus) warnings.push("PRE-SHOW PROMO is missing a WhatsApp status message.")
    if (!preShowPromo.videoScript) warnings.push("PRE-SHOW PROMO is missing a 30-second video/story script.")
  }

  return { items, warnings, metadata, showId, preShowPromo }
}

function isLinerLink(item: Pick<StudioItem, "title" | "script">) {
  return /liner link|station liner|\bP[12]\b/i.test(item.title) || /\[LINER STARTS HERE/i.test(item.script)
}
