// Podcast mode: a pasted prep document becomes tappable cards on the iPad.
// Podcast preps are free-flowing conversations, not show plans, so this is a
// deliberately loose parser: sections, questions, transitions, and notes.

import { scopedKey } from "@/lib/user-scope"

export type PodcastCardKind = "question" | "transition" | "you" | "note"

export type PodcastCard = {
  id: string
  kind: PodcastCardKind
  text: string
}

export type PodcastSection = {
  id: string
  title: string
  cards: PodcastCard[]
}

export type PodcastDoc = {
  title: string
  openScript: string[]
  sections: PodcastSection[]
  importedAt: string
}

const DOC_KEY = "broadcastos-podcast-doc"
const COVERED_KEY = "broadcastos-podcast-covered"

const SECTION_STARTERS = /^(anchor|arc|the open|the shape|producer notes|before the session|logistics)/i
const OPEN_SECTION = /^the open/i
const SKIP_SECTIONS = /^(the shape|producer notes|before the session|logistics)/i

function looksLikeHeader(line: string) {
  if (SECTION_STARTERS.test(line)) return true
  const letters = line.replace(/[^a-zA-Z]/g, "")
  if (letters.length < 4 || line.length > 80) return false
  const caps = letters.replace(/[^A-Z]/g, "")
  return caps.length / letters.length >= 0.8
}

/** Loose parse of a pasted podcast prep into sections of tappable cards. */
export function parsePodcastNotes(raw: string): PodcastDoc {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)

  const doc: PodcastDoc = { title: "Podcast", openScript: [], sections: [], importedAt: new Date().toISOString() }
  let current: PodcastSection | null = null
  let inOpen = false
  let inSkipped = false
  let titleTaken = false
  let cardSeq = 0

  const nextId = () => `card-${++cardSeq}`

  for (const line of lines) {
    if (!titleTaken) {
      doc.title = line.replace(/^the premier gospel podcast\s*[·:-]?\s*/i, "") || line
      titleTaken = true
      continue
    }

    if (looksLikeHeader(line)) {
      inOpen = OPEN_SECTION.test(line)
      inSkipped = SKIP_SECTIONS.test(line)
      current = null
      if (!inOpen && !inSkipped) {
        current = { id: `section-${doc.sections.length + 1}`, title: line, cards: [] }
        doc.sections.push(current)
      }
      continue
    }

    if (inOpen) {
      doc.openScript.push(line)
      continue
    }
    if (inSkipped || !current) continue

    if (/^\d+[.)]\s+/.test(line)) {
      current.cards.push({ id: nextId(), kind: "question", text: line.replace(/^\d+[.)]\s+/, "") })
    } else if (/^transition/i.test(line)) {
      current.cards.push({ id: nextId(), kind: "transition", text: line.replace(/^transition(\s+(in|out))?\s*[,:.]?\s*/i, "") })
    } else if (/^(adam at the table|you at the table|bring yourself)/i.test(line)) {
      current.cards.push({ id: nextId(), kind: "you", text: line.replace(/^(adam at the table|you at the table)\s*[,:.]?\s*/i, "") })
    } else {
      current.cards.push({ id: nextId(), kind: "note", text: line })
    }
  }

  return doc
}

export function questionCount(doc: PodcastDoc) {
  return doc.sections.reduce((sum, section) => sum + section.cards.filter((card) => card.kind === "question").length, 0)
}

export function loadPodcastDoc(): PodcastDoc | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(scopedKey(DOC_KEY))
    return raw ? (JSON.parse(raw) as PodcastDoc) : null
  } catch {
    return null
  }
}

export function savePodcastDoc(doc: PodcastDoc) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(scopedKey(DOC_KEY), JSON.stringify(doc))
  } catch {
    // Storage blocked: the session still works, it just won't survive a reload.
  }
}

export function clearPodcastDoc() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(scopedKey(DOC_KEY))
    window.localStorage.removeItem(scopedKey(COVERED_KEY))
  } catch {
    // Ignore.
  }
}

export function loadCovered(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(scopedKey(COVERED_KEY))
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

export function saveCovered(covered: Record<string, boolean>) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(scopedKey(COVERED_KEY), JSON.stringify(covered))
  } catch {
    // Ignore.
  }
}
