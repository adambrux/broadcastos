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
  closeScript?: string[]
  sections: PodcastSection[]
  importedAt: string
}

export type PodcastEpisode = {
  id: string
  doc: PodcastDoc
  covered: Record<string, boolean>
  savedAt: string
}

const DOC_KEY = "broadcastos-podcast-doc"
const COVERED_KEY = "broadcastos-podcast-covered"
const LIBRARY_KEY = "broadcastos-podcast-library"

const SECTION_STARTERS = /^(anchor|arc|the open|the close|the shape|producer notes|before the session|logistics)/i
const CLOSE_SECTION = /^the close/i
const OPEN_SECTION = /^the open/i
const SKIP_SECTIONS = /^(the shape|producer notes|before the session|logistics)/i

function looksLikeHeader(line: string) {
  // Real headers are short; a long line starting with "Anchor one, ..." is a
  // summary sentence inside a section, not a new section.
  if (SECTION_STARTERS.test(line) && line.length <= 60) return true
  const letters = line.replace(/[^a-zA-Z]/g, "")
  if (letters.length < 4 || line.length > 60) return false
  const caps = letters.replace(/[^A-Z]/g, "")
  return caps.length / letters.length >= 0.8
}

/** Loose parse of a pasted podcast prep into sections of tappable cards. */
export function parsePodcastNotes(raw: string): PodcastDoc {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)

  const doc: PodcastDoc = { title: "Podcast", openScript: [], closeScript: [], sections: [], importedAt: new Date().toISOString() }
  let current: PodcastSection | null = null
  let inOpen = false
  let inClose = false
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
      inClose = CLOSE_SECTION.test(line)
      inSkipped = SKIP_SECTIONS.test(line)
      current = null
      if (!inOpen && !inClose && !inSkipped) {
        current = { id: `section-${doc.sections.length + 1}`, title: line, cards: [] }
        doc.sections.push(current)
      }
      continue
    }

    if (inOpen || inClose) {
      // Pasted converts can flatten a spoken block into one paragraph; break it
      // back into spoken lines so it reads at teleprompter size.
      const target = inOpen ? doc.openScript : (doc.closeScript as string[])
      if (line.length > 160) {
        target.push(...line.split(/(?<=[.!?\u2026])\s+/).map((part) => part.trim()).filter(Boolean))
      } else {
        target.push(line)
      }
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

export function loadLibrary(): PodcastEpisode[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(scopedKey(LIBRARY_KEY))
    if (raw) return JSON.parse(raw) as PodcastEpisode[]
    // One-time move of the single-episode era into the library shelf.
    const legacyDoc = window.localStorage.getItem(scopedKey(DOC_KEY))
    if (legacyDoc) {
      const doc = JSON.parse(legacyDoc) as PodcastDoc
      const coveredRaw = window.localStorage.getItem(scopedKey(COVERED_KEY))
      const episode: PodcastEpisode = {
        id: `episode-${Date.now()}`,
        doc,
        covered: coveredRaw ? (JSON.parse(coveredRaw) as Record<string, boolean>) : {},
        savedAt: doc.importedAt || new Date().toISOString(),
      }
      const library = [episode]
      window.localStorage.setItem(scopedKey(LIBRARY_KEY), JSON.stringify(library))
      window.localStorage.removeItem(scopedKey(DOC_KEY))
      window.localStorage.removeItem(scopedKey(COVERED_KEY))
      return library
    }
    return []
  } catch {
    return []
  }
}

function saveLibrary(library: PodcastEpisode[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(scopedKey(LIBRARY_KEY), JSON.stringify(library))
  } catch {
    // Storage blocked: the session still works, it just won't survive a reload.
  }
}

export function addEpisode(doc: PodcastDoc): PodcastEpisode[] {
  const episode: PodcastEpisode = { id: `episode-${Date.now()}`, doc, covered: {}, savedAt: new Date().toISOString() }
  const library = [episode, ...loadLibrary()]
  saveLibrary(library)
  return library
}

export function removeEpisode(id: string): PodcastEpisode[] {
  const library = loadLibrary().filter((episode) => episode.id !== id)
  saveLibrary(library)
  return library
}

export function updateEpisodeCovered(id: string, covered: Record<string, boolean>): PodcastEpisode[] {
  const library = loadLibrary().map((episode) => (episode.id === id ? { ...episode, covered } : episode))
  saveLibrary(library)
  return library
}
